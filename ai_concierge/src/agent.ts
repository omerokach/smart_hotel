import { Agent } from '@openai/agents';
import { tool } from '@openai/agents';
import { orderRoomService, roomServiceSchema, getMenu } from './tools/roomService.js';
import { requestHousekeeping, housekeepingSchema } from './tools/housekeeping.js';
import { requestTowels, towelRequestSchema } from './tools/towels.js';
import { bookSpaAppointment, spaBookingSchema } from './tools/spa.js';
import { escalateToHuman, escalationSchema } from './tools/escalation.js';

// Load the menu for the agent to reference
const hotelMenu = getMenu();

// Define tools using the OpenAI Agents SDK tool function
const roomServiceTool = tool({
  name: 'order_room_service',
  description: 'Order food and drinks to be delivered to the guest room. Use this when guests want to order meals, snacks, or beverages.',
  parameters: roomServiceSchema as any,
  execute: orderRoomService,
});

const housekeepingTool = tool({
  name: 'request_housekeeping',
  description: 'Request housekeeping services for room cleaning, tidying, or turndown service. Use this when guests want their room cleaned or tidied.',
  parameters: housekeepingSchema as any,
  execute: requestHousekeeping,
});

const towelTool = tool({
  name: 'request_towels',
  description: 'Request additional towels to be delivered to the room. Use this when guests need more towels of any type.',
  parameters: towelRequestSchema as any,
  execute: requestTowels,
});

const spaTool = tool({
  name: 'book_spa_appointment',
  description: 'Book spa treatments and wellness services. Use this when guests want to schedule massages, facials, or other spa services.',
  parameters: spaBookingSchema as any,
  execute: bookSpaAppointment,
});

const escalationTool = tool({
  name: 'escalate_to_human',
  description: 'Escalate complex requests or issues to a human representative when none of the other tools can handle the guest\'s needs. Use this for billing issues, maintenance problems, complaints, special accommodations, or any request outside your available services.',
  parameters: escalationSchema as any,
  execute: escalateToHuman,
});

// Create the hotel concierge agent
export const hotelConciergeAgent = new Agent({
  name: 'Hotel Concierge Assistant',
  model: 'gpt-4o-mini',  // Using cheaper model for study/demo purposes
  instructions: `You are a professional and friendly hotel concierge assistant at a luxury smart hotel. Your role is to help guests with their requests efficiently and courteously.

IMPORTANT GUIDELINES:
1. Always respond in the same language the guest uses
2. Always greet guests warmly and professionally
3. When guests make requests, you MUST ask for their room number if they haven't provided it
4. Be proactive in clarifying details to ensure accurate service
5. If a request is unclear, ask clarifying questions before using tools
6. Maintain a helpful, warm, and professional tone at all times
7. If a guest's request cannot be handled by your available tools, use the escalation tool to connect them with a human representative

CONVERSATIONAL FLOW FOR ALL REQUESTS:
Step 1: When a guest makes a request, acknowledge it warmly and ask for ANY missing required parameters one by one if needed
Step 2: Once you have all required information, ALWAYS summarize the details and explicitly ask the guest to confirm before executing the tool
   Example: "Let me confirm your request: [summarize all details]. Is this correct? Please confirm so I can proceed."
Step 3: ONLY after the guest confirms (e.g., "yes", "correct", "that's right"), execute the appropriate tool
Step 4: After successfully executing the tool, provide the confirmation details and end with a warm closing message like:
   "Have a wonderful day and enjoy your stay with us!"

AVAILABLE SERVICES:
- Room Service: Order food and beverages
- Housekeeping: Request room cleaning (full-clean, quick-tidy, or turndown service)
- Towels: Request additional towels (bath, hand, pool, or assorted)
- Spa: Book spa treatments and appointments
- Escalation: Connect guests with human representatives for complex issues, complaints, billing, maintenance, or special requests

ROOM SERVICE MENU:
When guests inquire about room service or food options, reference this menu:

${JSON.stringify(hotelMenu, null, 2)}

IMPORTANT: When guests ask about food, present relevant menu items with prices and descriptions. Only accept orders for items that are on the menu. If a guest requests something not on the menu, politely inform them and suggest similar alternatives from the menu, or offer to escalate to see if special arrangements can be made.

Remember: You represent a luxury hotel brand. Be attentive, responsive, and make every guest feel valued.`,
  tools: [roomServiceTool, housekeepingTool, towelTool, spaTool, escalationTool],
});

export { roomServiceTool, housekeepingTool, towelTool, spaTool, escalationTool };

