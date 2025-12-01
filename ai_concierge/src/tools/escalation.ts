import { z } from 'zod';
import type { EscalationRequest } from '../types.js';
import { getCurrentRoomNumber } from '../sessionContext.js';

export const escalationSchema = z.object({
  requestType: z.string().describe('Brief category of the request (e.g., "billing issue", "maintenance", "special accommodation")'),
  description: z.string().describe('Detailed description of what the guest needs help with'),
  urgency: z.enum(['low', 'medium', 'high']).describe('How urgent is this request: low (can wait), medium (same day), high (immediate attention needed)'),
});

export async function escalateToHuman(params: z.infer<typeof escalationSchema>): Promise<EscalationRequest> {
  console.log('🚨 Escalating to human representative...');
  console.log('📝 Request Type:', params.requestType);
  console.log('📄 Description:', params.description);
  console.log('⚡ Urgency:', params.urgency);
  
  const API_URL = process.env.TASKS_API_URL || 'http://localhost:3001';
  const ticketId = generateTicketId();
  const estimatedResponse = getEstimatedResponseTime(params.urgency);
  
  let taskId: number | null = null;
  
  try {
    // Step 1: Create the task with escalation details
    const priorityMap = {
      'low': 'Low',
      'medium': 'Normal',
      'high': 'Urgent'
    };
    
    const roomNumber = getCurrentRoomNumber();
    const taskPayload = {
      room_number: roomNumber,
      request_type: "escalation",
      assigned_department: "Chat",
      internal_notes: `Escalation Type: ${params.requestType}\nDescription: ${params.description}\nUrgency: ${params.urgency}`,
      status: "open",
      priority: priorityMap[params.urgency],
      opening_channel: "app",
      request_details: params.description,
      escalation: true,
    };
    
    console.log('📝 Creating escalation task...', taskPayload);
    
    const taskResponse = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskPayload),
    });
    
    if (!taskResponse.ok) {
      console.error('❌ Failed to create task:', taskResponse.status);
      throw new Error('Failed to create escalation task');
    }
    
    const taskResult = await taskResponse.json() as any;
    taskId = taskResult.task_id || taskResult.id;
    
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                   ESCALATION TASK CREATED                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('📋 TASK ID:', taskId);
    console.log('🏨 Room Number:', roomNumber);
    console.log('🏷️  Request Type: escalation');
    console.log('👥 Department: Chat');
    console.log('⚡ Priority:', priorityMap[params.urgency]);
    console.log('');
    
    // Note: Conversation history will be saved by the server after escalation is detected
    
  } catch (error) {
    console.error('❌ Error during escalation:', error);
  }
  
  const escalation: EscalationRequest = {
    requestType: params.requestType,
    description: params.description,
    urgency: params.urgency,
    ticketId,
    estimatedResponse,
    status: 'pending',
    taskId: taskId || undefined,
  };
  
  return escalation;
}

function generateTicketId(): string {
  return `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function getEstimatedResponseTime(urgency: string): string {
  switch (urgency) {
    case 'high':
      return 'Within 15 minutes';
    case 'medium':
      return 'Within 2 hours';
    case 'low':
      return 'Within 24 hours';
    default:
      return 'As soon as possible';
  }
}

