import { z } from 'zod';
import type { RoomServiceOrder } from '../types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { trackServiceToolExecution } from '../toolExecutionTracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the menu
let menu: any = null;
export function getMenu() {
  if (!menu) {
    const menuPath = join(__dirname, '../data/menu.json');
    menu = JSON.parse(readFileSync(menuPath, 'utf-8'));
  }
  return menu;
}

// Tool-specific behavioral instructions
export const roomServiceInstructions = `
ROOM SERVICE FLOW:

1. IF (Request is generic e.g. "Order food"):
   → Say: "Hello! Welcome to our Room Service. I would be happy to help you place an order."
   → Show Menu

2. IF (User selects item e.g. "I want cheesecake") OR (Already selected):
   → Ask: "Excellent choice. Would you like to add any special instructions for your order?"

3. IF (User answers special instructions) OR (Already answered):
   → Confirm naturally: "[Item name](, [special instructions if any]). That will be $[price]. Should I place this order for you?"
   → Examples:
      • "Cheesecake, no spicy. That will be $10. Should I place this order for you?"
      • "Caesar Salad with extra dressing. That will be $16. Should I place this order for you?"
      • "Club Sandwich and a Cappuccino. That will be $24. Should I place this order for you?"
   → Keep it conversational and friendly, not robotic.

4. IF (User confirms e.g. "Yes", "Correct"):
   → EXECUTE TOOL: orderRoomService
   → Say: "Perfect! Your order has been placed and will arrive in 20-30 minutes. Have a wonderful day and enjoy your stay with us!"

CRITICAL:
- DO NOT loop back to previous steps.
- DO NOT ask "How can I assist you?".
- EXECUTE the tool immediately upon confirmation.
- Keep confirmations SHORT and NATURAL - avoid phrases like "with no spicy instructions" or "Let me confirm your order:".
`;

export function getRoomServiceMenu() {
  return getMenu();
}

export const roomServiceSchema = z.object({
  items: z.array(z.string()).describe('List of food/drink items to order'),
  specialInstructions: z.string().optional().nullable().describe('Any special requests or dietary restrictions'),
});

export async function orderRoomService(params: z.infer<typeof roomServiceSchema>): Promise<RoomServiceOrder> {
  // Track this service tool execution
  trackServiceToolExecution('order_room_service', params);
  
  // Simulate API call to hotel system
  console.log('🍽️  Processing room service order...', params);
  
  // In a real application, this would:
  // 1. Validate room number against hotel database
  // 2. Check item availability in kitchen
  // 3. Calculate estimated delivery time
  // 4. Create order in POS system
  // 5. Notify kitchen staff
  
  const estimatedTime = calculateEstimatedTime(params.items.length);
  
  const order: RoomServiceOrder = {
    items: params.items,
    specialInstructions: params.specialInstructions,
    estimatedTime,
  };
  
  return order;
}

function calculateEstimatedTime(itemCount: number): string {
  const baseTime = 20; // base 20 minutes
  const additionalTime = itemCount * 5; // 5 minutes per item
  const total = baseTime + additionalTime;
  return `${total}-${total + 10} minutes`;
}

