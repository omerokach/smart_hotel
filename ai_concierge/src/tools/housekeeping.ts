import { z } from 'zod';
import type { HousekeepingRequest } from '../types.js';
import { trackServiceToolExecution } from '../toolExecutionTracker.js';

// Tool-specific behavioral instructions
export const housekeepingInstructions = `
HOUSEKEEPING TOOL - EXACT CONVERSATION FLOW:

STEP 1: INITIAL REQUEST (User clicks button or says "Housekeeping")
→ Response: "Hi! I can help with housekeeping. Would you like a Full Cleaning (linen and towel change) or a Quick Tidy (bed making and basic organization)?"

STEP 2: GUEST SELECTS SERVICE (User says "Full cleaning")
→ Response: "Got it! When would you like us to come by? (You can say a specific time or 'as soon as possible')"

STEP 3: GUEST PROVIDES TIME (User says "2:00 PM" or "asap")
→ Confirm naturally: "[Service type], [time]. Should I schedule it?"
→ Examples:
   • "Full Cleaning, at 2:00 PM. Should I schedule it?"
   • "Full Cleaning, as soon as possible. Should I schedule it?"
   • "Quick Tidy, this afternoon. Should I schedule it?"
→ Keep it SHORT and conversational.

STEP 4: CONFIRMATION (User says "Yes/Confirm")
→ Execute housekeepingTool
→ Response: "Done! Housekeeping will be there [time]. Enjoy your day!"

CRITICAL RULES:
- If user ALREADY specified service (e.g. "I want full cleaning"), SKIP Step 1 and go STRAIGHT to Step 2.
- Execute tool ONLY after Step 4 (Guest confirms).
- Keep confirmations SHORT and NATURAL - avoid "Let me confirm your request:" or robotic phrasing.
`;

export const housekeepingSchema = z.object({
  serviceType: z.enum(['full-clean', 'quick-tidy', 'turndown']).describe(
    'Type of service: full-clean (complete room cleaning), quick-tidy (light tidying), or turndown (evening service)'
  ),
  preferredTime: z.string().optional().nullable().describe('Preferred time for service (e.g., "2:00 PM", "now", "this afternoon")'),
});

export async function requestHousekeeping(params: z.infer<typeof housekeepingSchema>): Promise<HousekeepingRequest> {
  // Track this service tool execution
  trackServiceToolExecution('request_housekeeping', params);
  
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

