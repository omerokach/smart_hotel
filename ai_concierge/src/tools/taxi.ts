import { z } from 'zod';
import type { TaxiOrder } from '../types.js';
import { trackServiceToolExecution } from '../toolExecutionTracker.js';

// Tool-specific behavioral instructions
export const taxiInstructions = `
TAXI TOOL - EXACT CONVERSATION FLOW:

STEP 1: INITIAL REQUEST (User clicks button or says "Order Taxi")
→ Response: "Hello! I would be happy to order a taxi for you. Please specify your exact destination, the time of pickup, and the number of passengers."

STEP 2: GUEST PROVIDES DETAILS (User gives destination/time/passengers)
→ Response: "Thank you. A taxi to [destination], for [day] at [time], for [number] passengers. Would you like to add any specific notes for the driver?"

STEP 3: SPECIAL NOTES (User says "No" or adds notes)
→ Confirm naturally: "A taxi to [destination] for [number] passenger(s), [day] at [time]. Should I book it?"
→ Examples:
   • "A taxi to TLV Airport for 2 passengers, tomorrow at 10:00. Should I book it?"
   • "A taxi to the city center for 1 passenger, today at 3:00 PM. Should I book it?"
   • "A taxi to Hilton Hotel for 3 passengers, Monday at 9:00 AM. Should I book it?"
→ Keep it conversational - use "for tomorrow" not "at tomorrow".

STEP 4: CONFIRMATION (User says "Yes/Confirm")
→ Execute taxiTool
→ Response: "Your taxi is booked! It will be waiting at the hotel entrance [day] at [time]. Have a wonderful day and enjoy your stay with us!"

CRITICAL RULES:
- If user provides details in first message, SKIP Step 1 and go STRAIGHT to Step 2.
- Execute tool ONLY after Step 4 (Guest confirms).
- Keep confirmations SHORT and NATURAL - avoid robotic phrasing like "at tomorrow at".
`;

export const taxiSchema = z.object({
  destination: z.string().describe('Where the guest wants to go (e.g., "airport", "downtown", "123 Main St")'),
  numberOfPassengers: z.number().min(1).max(8).describe('Number of passengers (1-8)'),
  pickupDay: z.string().describe('Day for pickup (e.g., "today", "tomorrow", "Monday", "December 25")'),
  pickupTime: z.string().describe('Time for pickup (e.g., "3:00 PM", "14:00", "now")'),
});

export async function orderTaxi(params: z.infer<typeof taxiSchema>): Promise<TaxiOrder> {
  // Track this service tool execution
  trackServiceToolExecution('order_taxi', params);
  
  // Simulate API call to taxi service
  console.log('🚕 Processing taxi order...', params);
  
  // In a real application, this would:
  // 1. Contact preferred taxi service or ride-sharing app
  // 2. Calculate estimated cost and travel time
  // 3. Reserve the vehicle
  // 4. Send confirmation to guest
  // 5. Track taxi arrival status
  
  const orderId = generateTaxiOrderId();
  
  const order: TaxiOrder = {
    destination: params.destination,
    numberOfPassengers: params.numberOfPassengers,
    pickupDay: params.pickupDay,
    pickupTime: params.pickupTime,
    orderId,
  };
  
  return order;
}

function generateTaxiOrderId(): string {
  return `TAXI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

