import { z } from 'zod';
import type { TaxiOrder } from '../types.js';

// Tool-specific behavioral instructions
export const taxiInstructions = `
TAXI TOOL - EXACT CONVERSATION FLOW:

STEP 1: INITIAL REQUEST (User clicks button or says "Order Taxi")
→ Response: "Hello! I would be happy to order a taxi for you. Please specify your exact destination, the time of pickup, and the number of passengers."

STEP 2: GUEST PROVIDES DETAILS (User gives destination/time/passengers)
→ Response: "Thank you. A taxi to [destination], for [time], for [number] passengers. Would you like to add any specific notes for the driver?"

STEP 3: SPECIAL NOTES (User says "No" or adds notes)
→ Response: "Let me confirm your request: Ordering a taxi to [destination], for [time], for [number] passengers. Is this correct? Please confirm so I can proceed."

STEP 4: CONFIRMATION (User says "Yes/Confirm")
→ Execute taxiTool
→ Response: "Great. Your taxi has been booked and will be waiting for you at the hotel entrance at [time]. Have a wonderful day and enjoy your stay with us!"

CRITICAL RULES:
- If user provides details in first message, SKIP Step 1 and go STRAIGHT to Step 2.
- Execute tool ONLY after Step 4 (Guest confirms).
`;

export const taxiSchema = z.object({
  destination: z.string().describe('Where the guest wants to go (e.g., "airport", "downtown", "123 Main St")'),
  numberOfPassengers: z.number().min(1).max(8).describe('Number of passengers (1-8)'),
  pickupDay: z.string().describe('Day for pickup (e.g., "today", "tomorrow", "Monday", "December 25")'),
  pickupTime: z.string().describe('Time for pickup (e.g., "3:00 PM", "14:00", "now")'),
});

export async function orderTaxi(params: z.infer<typeof taxiSchema>): Promise<TaxiOrder> {
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

