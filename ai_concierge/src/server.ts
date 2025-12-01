// Web server with REST API for the chat interface
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { run } from '@openai/agents';
import { hotelConciergeAgent } from './agent.js';
import { getAndClearLastServiceToolExecution, getAndClearLastEscalationExecution } from './toolExecutionTracker.js';
import { getMenu } from './tools/roomService.js';
import { setCurrentRoomNumber } from './sessionContext.js';

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = 'https://smart-hotel-tasks-api.onrender.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper functions for TaskMessages API integration
async function saveMessageToTask(taskId: number, sender: string, message: string, roomNumber: string = "103"): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, message, room_number: roomNumber }),
    });
    
    if (!response.ok) {
      console.error('❌ Failed to save message to task:', response.status);
      return false;
    }
    
    const savedMessage = await response.json() as any;
    const messageId = savedMessage.message_id || savedMessage.id;
    
    console.log('💬 Message saved to TaskMessages');
    console.log('   📋 Task ID:', taskId);
    console.log('   🆔 Message ID:', messageId);
    console.log('   👤 Sender:', sender);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Error saving message to task:', error);
    return false;
  }
}

async function getNewAgentMessages(taskId: number, since: Date | null): Promise<Array<{ sender: string; message: string; timestamp: string }>> {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/messages`);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch messages:', response.status);
      return [];
    }
    
    const messages = await response.json() as Array<{ sender: string; message: string; timestamp: string }>;
    
    // Filter for staff messages that are newer than the last check
    const agentMessages = messages.filter(msg => {
      if (msg.sender !== 'staff') return false;
      if (!since) return true;
      return new Date(msg.timestamp) > since;
    });
    
    return agentMessages;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return [];
  }
}

// Periodic polling for escalated sessions
function startPollingForAgentMessages() {
  setInterval(async () => {
    for (const [sessionId, session] of sessions.entries()) {
      if (session.escalated && session.taskId) {
        try {
          const newMessages = await getNewAgentMessages(session.taskId, session.lastMessageCheck);
          
          if (newMessages.length > 0) {
            console.log(`📬 Background polling found ${newMessages.length} new staff message(s) for session ${sessionId} (waiting for frontend to fetch)`);
            
            // We don't add messages or update lastMessageCheck here
            // The frontend polling will fetch and display them
            // This prevents race conditions between background and frontend polling
          }
        } catch (error) {
          console.error(`❌ Error polling messages for session ${sessionId}:`, error);
        }
      }
    }
  }, 4000); // Poll every 4 seconds
}

// Store conversation history per session (in production, use a proper database)
interface Session {
  messages: Array<{ role: string; content: string }>;
  escalated: boolean;
  taskId: number | null;
  lastMessageCheck: Date | null;
  roomNumber: string;
}

const sessions = new Map<string, Session>();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default', roomNumber = '103' } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { 
        messages: [], 
        escalated: false, 
        taskId: null, 
        lastMessageCheck: null,
        roomNumber: roomNumber 
      });
      console.log(`🏨 New session created with room number: ${roomNumber}`);
    }
    
    const session = sessions.get(sessionId)!;
    
    // Add user message to history
    session.messages.push({ role: 'user', content: message });
    
    // CHECK IF SESSION IS ESCALATED - Handle differently
    if (session.escalated && session.taskId) {
      console.log('');
      console.log('🔄 ESCALATED SESSION - Relaying message');
      console.log('📋 Task ID:', session.taskId);
      console.log('');
      
      // Save guest message to TaskMessages
      await saveMessageToTask(session.taskId, 'guest', message, session.roomNumber);
      
      // Check for new agent messages
      const newAgentMessages = await getNewAgentMessages(session.taskId, session.lastMessageCheck);
      
      // Update last check time
      session.lastMessageCheck = new Date();
      
      if (newAgentMessages.length > 0) {
        // Return the latest agent message
        const latestMessage = newAgentMessages[newAgentMessages.length - 1];
        const agentResponse = latestMessage.message;
        
        // Add to session history
        session.messages.push({ role: 'assistant', content: agentResponse });
        
        return res.json({
          response: agentResponse,
          sessionId,
          chatEnded: false,
          taskId: session.taskId,
          escalated: true,
        });
      } else {
        // No agent response yet
        const waitingMessage = "Your message has been sent to our representative. They will respond shortly.";
        session.messages.push({ role: 'assistant', content: waitingMessage });
        
        return res.json({
          response: waitingMessage,
          sessionId,
          chatEnded: false,
          taskId: session.taskId,
          escalated: true,
        });
      }
    }
    
    // NORMAL AI FLOW - Session not escalated
    console.log('Session has', session.messages.length, 'messages');
    
    // Set current room number for tools to access
    setCurrentRoomNumber(session.roomNumber);
    
    // Create context from recent history (last 4 messages)
    const recentHistory = session.messages.slice(-5, -1); // Exclude current message
    let contextPrefix = "";
    if (recentHistory.length > 0) {
      contextPrefix = "[Previous conversation context:\n";
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'Guest' : 'Agent';
        contextPrefix += `${role}: ${msg.content}\n`;
      });
      contextPrefix += "]\n\nGuest's current message: ";
    }
    
    const messageWithContext = contextPrefix + message;
    const result = await run(hotelConciergeAgent, messageWithContext);
    
    // Add assistant response to history
    session.messages.push({ role: 'assistant', content: result.finalOutput || '' });
    
    // Check if escalation tool was executed
    const escalationExecution = getAndClearLastEscalationExecution();
    
    console.log('🔍 Checking for escalation execution:', escalationExecution ? 'FOUND' : 'NOT FOUND');
    if (escalationExecution) {
      console.log('📦 Escalation execution details:', JSON.stringify(escalationExecution, null, 2));
    }
    
    if (escalationExecution && escalationExecution.result?.taskId) {
      console.log('🚨 Escalation detected - switching to chat mode for task', escalationExecution.result.taskId);
      
      const escalatedTaskId = escalationExecution.result.taskId;
      
      console.log('🔧 Original AI response:', session.messages[session.messages.length - 1]?.content);
      
      // FORCE the correct response message - override whatever the AI said
      const correctResponse = `We've got your message and one of our team will reach out to you very soon! Please keep the chat open :)`;
      
      console.log('✅ Forced correct response:', correctResponse);
      
      // Replace the last assistant message with the correct response
      session.messages[session.messages.length - 1] = { role: 'assistant', content: correctResponse };
      
      // Save conversation history to TaskMessages (excluding the last assistant message which is the escalation response)
      const historyToSave = session.messages.slice(0, -1); // Exclude the escalation response itself
      console.log(`💾 Saving ${historyToSave.length} conversation messages to task ${escalatedTaskId}...`);
      
      for (const msg of historyToSave) {
        await saveMessageToTask(escalatedTaskId, 'guest', msg.content, session.roomNumber);
      }
      
      // Update session to escalated state
      session.escalated = true;
      session.taskId = escalatedTaskId;
      session.lastMessageCheck = new Date();
      
      console.log('✅ Session escalated:', { sessionId, taskId: session.taskId });
    }
    
    // Check if any service tool was executed using our tracker
    const serviceExecution = getAndClearLastServiceToolExecution();
    
    let chatEnded = false;
    let taskId: number | null = null;
    
    // If a service tool was executed, automatically create a task and end chat
    if (serviceExecution) {
      console.log('🔔 Service tool detected - automatically creating task and ending chat');
      console.log('Tool:', serviceExecution.toolName, 'Args:', serviceExecution.args);
      
      // Map tool names to request types
      const requestTypeMap: Record<string, string> = {
        'order_room_service': 'Room Service',
        'request_housekeeping': 'Housekeeping',
        'book_spa_appointment': 'Spa Service',
        'order_taxi': 'Transportation',
        'request_extra_equipment': 'Equipment Request',
      };
      
      const requestType = requestTypeMap[serviceExecution.toolName] || 'General Request';
      
      // Create a human-readable summary of the request
      let requestDetails = 'Service request from guest';
      try {
        const args = serviceExecution.args;
        
        switch (serviceExecution.toolName) {
          case 'order_room_service':
            const items = args.items || [];
            const menu = getMenu();
            let totalPrice = 0;
            
            // Build item list with prices
            const itemDescriptions = items.map((item: string) => {
              // Search for the item in all menu categories
              let price = 0;
              let foundItem = null;
              
              for (const category of Object.values(menu) as any[]) {
                foundItem = category.items?.find((menuItem: any) => 
                  menuItem.name.toLowerCase() === item.toLowerCase()
                );
                if (foundItem) {
                  price = foundItem.price;
                  totalPrice += price;
                  break;
                }
              }
              
              return price > 0 ? `${item} ($${price})` : item;
            });
            
            const itemList = itemDescriptions.join(', ');
            const specialInstr = args.specialInstructions ? `, Special instructions: ${args.specialInstructions}` : '';
            requestDetails = `${itemList}${specialInstr}`;
            break;
            
          case 'request_housekeeping':
            const serviceType = args.serviceType === 'full-clean' ? 'Full Cleaning' : 
                               args.serviceType === 'quick-tidy' ? 'Quick Tidy' : 'Turndown Service';
            const time = args.preferredTime || 'ASAP';
            requestDetails = `${serviceType} requested for ${time}`;
            break;
            
          case 'book_spa_appointment':
            const treatment = args.treatment || 'spa treatment';
            const appointmentTime = args.preferredTime || 'TBD';
            const duration = args.duration ? `${args.duration} minutes` : '';
            requestDetails = `${treatment} appointment at ${appointmentTime}${duration ? `, ${duration}` : ''}`;
            break;
            
          case 'order_taxi':
            const destination = args.destination || 'unknown';
            const passengers = args.numberOfPassengers || 1;
            const pickup = `${args.pickupDay || 'today'} at ${args.pickupTime || 'TBD'}`;
            requestDetails = `Taxi to ${destination} for ${passengers} passenger${passengers !== 1 ? 's' : ''}, pickup ${pickup}`;
            break;
            
          case 'request_extra_equipment':
            const equipType = args.equipmentType || 'item';
            const qty = args.quantity || 1;
            // Handle pluralization - special cases for items that are already plural
            let displayItem = equipType;
            if (qty === 1) {
              // Convert plural to singular for quantity 1
              if (equipType === 'towels') displayItem = 'towel';
              else if (equipType === 'gloves') displayItem = 'glove';
              else if (equipType === 'slippers') displayItem = 'slipper';
              else if (equipType === 'hangers') displayItem = 'hanger';
            } else {
              // For quantity > 1, pluralize if not already plural
              if (!equipType.endsWith('s')) displayItem = `${equipType}s`;
            }
            requestDetails = `${qty} ${displayItem}`;
            break;
            
          default:
            requestDetails = JSON.stringify(args).substring(0, 200);
        }
      } catch (e) {
        console.error('Error formatting request details:', e);
        requestDetails = 'Service request from guest';
      }
      
      // Map tool names to departments
      const departmentMap: Record<string, string> = {
        'request_housekeeping': 'Maintenance',
        'request_extra_equipment': 'Maintenance',
        'order_room_service': 'Restaurant',
        'book_spa_appointment': 'Wellness',
        'order_taxi': 'Front Desk',
      };
      
      const assignedDepartment = departmentMap[serviceExecution.toolName] || 'Front Desk';
      
      // Create task via API
      try {
        const taskPayload = {
          room_number: session.roomNumber,
          request_type: requestType,
          assigned_department: assignedDepartment,
          status: "open",
          priority: "Normal",
          request_details: requestDetails,
          opening_channel: "app",
        };
        
        const taskResponse = await fetch(`${API_URL}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskPayload),
        });
        
        if (taskResponse.ok) {
          const taskResult = await taskResponse.json() as any;
          taskId = taskResult.task_id || taskResult.id;
          chatEnded = true;
          console.log('✅ Task created successfully:', taskId);
        } else {
          console.error('❌ Failed to create task:', taskResponse.status);
        }
      } catch (error) {
        console.error('❌ Error creating task:', error);
      }
    }
    
    // Return response - use the last message from session (which may have been corrected for escalation)
    const responseToSend = session.messages[session.messages.length - 1]?.content || result.finalOutput || '';
    
    res.json({
      response: responseToSend,
      sessionId,
      chatEnded,
      taskId,
    });
    
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check for new staff messages endpoint (for frontend polling)
app.get('/api/check-messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.json({ newMessages: [] });
    }
    
    // Only check if session is escalated
    if (!session.escalated || !session.taskId) {
      return res.json({ newMessages: [] });
    }
    
    // Get new staff messages
    const newMessages = await getNewAgentMessages(session.taskId, session.lastMessageCheck);
    
    if (newMessages.length > 0) {
      // Update last check time
      session.lastMessageCheck = new Date();
      
      // Add messages to session history (check for duplicates)
      for (const msg of newMessages) {
        const exists = session.messages.some(m => 
          m.role === 'assistant' && m.content === msg.message
        );
        if (!exists) {
          session.messages.push({ role: 'assistant', content: msg.message });
        }
      }
      
      console.log(`📬 Sent ${newMessages.length} new staff message(s) to frontend for session ${sessionId}`);
    }
    
    return res.json({ 
      newMessages: newMessages.map(m => m.message),
      escalated: true 
    });
    
  } catch (error) {
    console.error('Error checking messages:', error);
    res.status(500).json({ error: 'Failed to check messages' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agent: 'Smart Hotel AI Concierge' });
});

// Clear session endpoint
app.delete('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  res.json({ message: 'Session cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🏨 Smart Hotel AI Concierge - Web Server            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📱 Chat UI: http://localhost:${PORT}`);
  console.log(`🔌 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  
  // Start polling for agent messages in escalated sessions
  startPollingForAgentMessages();
  console.log('🔄 Polling started for escalated chat sessions');
});

export default app;

