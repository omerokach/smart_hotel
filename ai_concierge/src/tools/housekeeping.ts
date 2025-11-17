import { z } from 'zod';
import type { HousekeepingRequest } from '../types.js';

// Tool-specific behavioral instructions
export const housekeepingInstructions = `
HOUSEKEEPING TOOL - EXACT CONVERSATION FLOW:

1. Opening: "Welcome! I would be pleased to assist with your housekeeping request. Which service would you prefer? You may choose between: • Full Cleaning (Linen and towel change, comprehensive room cleaning) • Quick Tidy (Bed making and basic room organization)"
2. Guest selects service type
3. Ask: "Thank you. A [service type]. When would you like the housekeeping team to arrive at your room? (Please specify a preferred time, or 'As soon as possible')."
4. Guest provides time
5. Confirm: "Let me confirm your request: [Service type] service for your room, scheduled for [time]. Is this correct? Please confirm so I can proceed."
6. Guest confirms → Execute housekeepingTool
7. Final: "Excellent. Your request for a [service type] at [time] has been successfully registered. Have a wonderful day and enjoy your stay with us!"

CRITICAL: Execute tool ONLY after guest confirms all details.
`;

export const housekeepingSchema = z.object({
  serviceType: z.enum(['full-clean', 'quick-tidy', 'turndown']).describe(
    'Type of service: full-clean (complete room cleaning), quick-tidy (light tidying), or turndown (evening service)'
  ),
  preferredTime: z.string().optional().nullable().describe('Preferred time for service (e.g., "2:00 PM", "now", "this afternoon")'),
});

export async function requestHousekeeping(params: z.infer<typeof housekeepingSchema>): Promise<HousekeepingRequest> {
  // Simulate API call to housekeeping management system
  console.log('🧹 Processing housekeeping request...', params);
  
  // In a real application, this would:
  // 1. Validate room number
  // 2. Check housekeeping staff availability
  // 3. Schedule the service
  // 4. Send notification to housekeeping team
  // 5. Update room status in property management system
  
  const requestId = generateRequestId();
  
  const request: HousekeepingRequest = {
    serviceType: params.serviceType,
    preferredTime: params.preferredTime || 'As soon as possible',
    requestId,
  };
  
  return request;
}

function generateRequestId(): string {
  return `HK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

