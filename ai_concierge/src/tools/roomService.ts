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
ROOM SERVICE TOOL - EXACT CONVERSATION FLOW:

1. Opening: "Hello! Welcome to our Room Service. I would be happy to help you place an order."
   → Proactively show the complete menu organized by meal times (Breakfast, Lunch, Dinner, Desserts, Beverages)
2. Guest selects items
3. Ask: "Excellent choice. Would you like to add any special instructions for your order?"
4. Guest responds (yes/no to special instructions)
5. Confirm: "Let me confirm your order: [items with prices]. Is this correct? Please confirm so I can proceed."
6. Guest confirms → Execute roomServiceTool
7. Final: "Perfect! Your order has been placed and will arrive in 20-30 minutes. Have a wonderful day and enjoy your stay with us!"

CRITICAL: Execute tool ONLY after guest confirms all details.
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

