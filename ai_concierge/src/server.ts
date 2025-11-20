// Web server with REST API for the chat interface
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { run } from '@openai/agents';
import { hotelConciergeAgent } from './agent.js';
import { getAndClearLastServiceToolExecution } from './toolExecutionTracker.js';
import { getMenu } from './tools/roomService.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store conversation history per session (in production, use a proper database)
const sessions = new Map<string, { messages: Array<{ role: string; content: string }> }>();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { messages: [] });
    }
    
    const session = sessions.get(sessionId)!;
    
    // Add user message to history
    session.messages.push({ role: 'user', content: message });
    
    // The SDK has conflicts between runtime and serialization formats for history
    // Workaround: Build context string with conversation summary
    console.log('Session has', session.messages.length, 'messages');
    
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
        const API_URL = process.env.TASKS_API_URL || 'http://localhost:3001';
        const taskPayload = {
          room_number: "103",
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
    
    // Return response
    res.json({
      response: result.finalOutput || '',
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
});

export default app;

