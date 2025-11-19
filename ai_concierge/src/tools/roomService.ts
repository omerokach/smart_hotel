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

STEP 1: INITIAL REQUEST (User clicks button or says "Order room service")
→ Response: "Hello! Welcome to our Room Service. I would be happy to help you place an order."
   (Proactively show the complete menu organized by meal times)

STEP 2: GUEST SELECTS ITEMS (User says "I want a cheesecake")
→ CRITICAL: Do NOT show the menu again.
→ Response: "Excellent choice. Would you like to add any special instructions for your order?"

STEP 3: SPECIAL INSTRUCTIONS (User says "No" or adds notes)
→ Response: "Let me confirm your order: [items with prices]. Is this correct? Please confirm so I can proceed."

STEP 4: CONFIRMATION (User says "Yes/Confirm")
→ Execute roomServiceTool
→ Response: "Perfect! Your order has been placed and will arrive in 20-30 minutes. Have a wonderful day and enjoy your stay with us!"

CRITICAL RULES:
- If user ALREADY selected an item (e.g., "I want a cheesecake"), SKIP Step 1 and go STRAIGHT to Step 2.
- NEVER show the menu if the guest has already named their item.
- Execute tool ONLY after Step 4 (Guest confirms).
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

