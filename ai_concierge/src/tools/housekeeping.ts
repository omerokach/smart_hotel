import { z } from 'zod';
import type { HousekeepingRequest } from '../types.js';

// Tool-specific behavioral instructions
export const housekeepingInstructions = `
HOUSEKEEPING TOOL - EXACT CONVERSATION FLOW:

STEP 1: INITIAL REQUEST (User clicks button or says "Housekeeping")
→ Response: "Welcome! I would be pleased to assist with your housekeeping request. Which service would you prefer? You may choose between: • Full Cleaning (Linen and towel change, comprehensive room cleaning) • Quick Tidy (Bed making and basic room organization)"

STEP 2: GUEST SELECTS SERVICE (User says "Full cleaning")
→ Response: "Thank you. A [service type]. When would you like the housekeeping team to arrive at your room? (Please specify a preferred time, or 'As soon as possible')."

STEP 3: GUEST PROVIDES TIME (User says "2:00 PM")
→ Response: "Let me confirm your request: [Service type] service for your room, scheduled for [time]. Is this correct? Please confirm so I can proceed."

STEP 4: CONFIRMATION (User says "Yes/Confirm")
→ Execute housekeepingTool
→ Response: "Excellent. Your request for a [service type] at [time] has been successfully registered. Have a wonderful day and enjoy your stay with us!"

CRITICAL RULES:
- If user ALREADY specified service (e.g. "I want full cleaning"), SKIP Step 1 and go STRAIGHT to Step 2.
- Execute tool ONLY after Step 4 (Guest confirms).
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

