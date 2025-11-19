import { z } from 'zod';

// Environment-aware API URL
const API_URL = process.env.TASKS_API_URL || 'http://localhost:3001';

// Tool-specific behavioral instructions
export const endChatInstructions = `
END CHAT TOOL - AUTOMATIC EXECUTION:

This tool MUST be called automatically after providing the finish line acknowledgment for ANY service request.

When to call:
- After Room Service order is confirmed
- After Housekeeping request is confirmed
- After Spa booking is confirmed
- After Extra Equipment request is confirmed
- After Taxi order is confirmed

Parameters to extract:
- request_type: The type of service (e.g., "Room Service", "Housekeeping", "Spa Service", "Equipment Request", "Transportation")
- request_details: Brief summary of what was requested (e.g., "Tiramisu dessert order", "Full cleaning at 2 PM", "2 pool towels")
- priority: Set to "Normal" by default, "High" if urgent

CRITICAL: This tool creates a task in the hotel system and ends the chat session.
`;

export const endChatSchema = z.object({
  request_type: z.string().describe('Type of service requested (e.g., "Room Service", "Housekeeping", "Spa Service")'),
  request_details: z.string().describe('Brief summary of the request details'),
  priority: z.enum(['Normal', 'High', 'Low']).default('Normal').describe('Priority level of the request'),
});

interface TaskCreationResponse {
  success: boolean;
  task_id?: number;
  error?: string;
}

export async function endChat(params: z.infer<typeof endChatSchema>): Promise<TaskCreationResponse> {
  console.log('🔚 Ending chat and creating task...', params);
  
  // Construct the task payload
  const taskPayload = {
    room_number: "103",
    request_type: params.request_type,
    assigned_department: "Maintenance",
    status: "open",
    priority: params.priority,
    request_details: params.request_details,
    opening_channel: "app",
  };
  
  try {
    // Make POST request to Tasks API
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskPayload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create task:', response.status, errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }
    
    const result = await response.json();
    console.log('✅ Task created successfully:', result);
    
    return {
      success: true,
      task_id: result.task_id || result.id,
    };
    
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

