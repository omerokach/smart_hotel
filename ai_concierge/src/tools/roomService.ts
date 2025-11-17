import { z } from 'zod';
import type { RoomServiceOrder } from '../types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
ROOM SERVICE BEHAVIOR:
- When guests ask about room service or food options, reference the menu data provided
- Present relevant menu items with prices and descriptions
- Only accept orders for items that are on the menu
- If a guest requests something not on the menu, politely inform them and suggest similar alternatives from the menu
- For unavailable items, offer to escalate to see if special arrangements can be made

RESPONSE FORMAT:
- After confirmation, respond: "Perfect! Your order will arrive in 20-30 minutes. Enjoy!"
- Do NOT ask follow-up questions after confirming the order
- Keep the final response brief and close the conversation
`;

export function getRoomServiceMenu() {
  return getMenu();
}

export const roomServiceSchema = z.object({
  items: z.array(z.string()).describe('List of food/drink items to order'),
  specialInstructions: z.string().optional().nullable().describe('Any special requests or dietary restrictions'),
});

export async function orderRoomService(params: z.infer<typeof roomServiceSchema>): Promise<RoomServiceOrder> {
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

