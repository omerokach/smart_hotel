import { Agent } from '@openai/agents';
import { tool } from '@openai/agents';
import { orderRoomService, roomServiceSchema, getMenu } from './tools/roomService.js';
import { requestHousekeeping, housekeepingSchema } from './tools/housekeeping.js';
import { bookSpaAppointment, spaBookingSchema, getSpaMenu } from './tools/spa.js';
import { escalateToHuman, escalationSchema } from './tools/escalation.js';
import { orderTaxi, taxiSchema } from './tools/taxi.js';
import { requestExtraEquipment, extraEquipmentSchema } from './tools/extraEquipment.js';
import { getActivityHoursInfo, activityHoursSchema, getActivityHours } from './tools/activityHours.js';
import { getUpcomingEvents, eventsSchema, getEvents } from './tools/events.js';
import { getWifiPassword, wifiSchema } from './tools/wifi.js';

// Load the menus and data for the agent to reference
const hotelMenu = getMenu();
const spaMenu = getSpaMenu();
const activityHours = getActivityHours();
const upcomingEvents = getEvents();

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

const taxiTool = tool({
  name: 'order_taxi',
  description: 'Order a taxi for the guest. Use this when guests need transportation to a destination. Requires destination, number of passengers, pickup day, and pickup time.',
  parameters: taxiSchema as any,
  execute: orderTaxi,
});

const extraEquipmentTool = tool({
  name: 'request_extra_equipment',
  description: 'Request extra room equipment and amenities such as blankets, towels, toilet paper, robes, gloves, shampoo, conditioner, bath soap, pillows, hangers, etc. Use this when guests need additional room supplies.',
  parameters: extraEquipmentSchema as any,
  execute: requestExtraEquipment,
});

const activityHoursTool = tool({
  name: 'get_activity_hours',
  description: 'Get operating hours for hotel facilities like pool, gym, spa, bar, front desk, synagogue, breakfast, dinner, etc. Use this when guests ask about facility hours or schedules.',
  parameters: activityHoursSchema as any,
  execute: getActivityHoursInfo,
});

const eventsTool = tool({
  name: 'get_upcoming_events',
  description: 'Get information about upcoming events at the hotel such as concerts, yoga classes, workshops, lectures, and other activities. All events are free for hotel guests. Use this when guests ask about events, activities, or things to do.',
  parameters: eventsSchema as any,
  execute: getUpcomingEvents,
});

const wifiTool = tool({
  name: 'get_wifi_password',
  description: 'Provide WiFi network credentials to guests. Use this when guests ask for WiFi password, internet access, or network information.',
  parameters: wifiSchema as any,
  execute: getWifiPassword,
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
3. Be proactive in clarifying details to ensure accurate service
4. If a request is unclear, ask clarifying questions before using tools
5. Maintain a helpful, warm, and professional tone at all times
6. If a guest's request cannot be handled by your available tools, use the escalation tool to connect them with a human representative

CONVERSATIONAL FLOW FOR ALL REQUESTS:
Step 1: When a guest makes a request, acknowledge it warmly and ask for ANY missing required parameters one by one if needed
Step 2: Once you have all required information, ALWAYS summarize the details and explicitly ask the guest to confirm before executing the tool
   Example: "Let me confirm your request: [summarize all details]. Is this correct? Please confirm so I can proceed."
Step 3: ONLY after the guest confirms (e.g., "yes", "correct", "that's right"), execute the appropriate tool
Step 4: After successfully executing the tool, provide the confirmation details and end with a warm closing message like:
   "Have a wonderful day and enjoy your stay with us!"

AVAILABLE SERVICES:
- Room Service: Order food and beverages from our menu
- Housekeeping: Request room cleaning (full-clean, quick-tidy, or turndown service)
- Extra Equipment: Request additional room amenities (blankets, towels, toiletries, robes, pillows, etc.)
- Spa: Book spa treatments and appointments from our spa menu
- Taxi: Order transportation to any destination
- Activity Hours: Get operating hours for hotel facilities (pool, gym, bar, dining, synagogue, etc.)
- Events: Learn about upcoming free events (concerts, yoga, workshops, lectures)
- WiFi: Get WiFi network credentials
- Escalation: Connect guests with human representatives for complex issues, complaints, billing, maintenance, or special requests

ROOM SERVICE MENU:
When guests inquire about room service or food options, reference this menu:

${JSON.stringify(hotelMenu, null, 2)}

IMPORTANT: When guests ask about food, present relevant menu items with prices and descriptions. Only accept orders for items that are on the menu. If a guest requests something not on the menu, politely inform them and suggest similar alternatives from the menu, or offer to escalate to see if special arrangements can be made.

SPA MENU:
When guests inquire about spa services, wellness treatments, or relaxation options, reference this spa menu:

${JSON.stringify(spaMenu, null, 2)}

IMPORTANT: When guests ask about spa treatments, present relevant options with prices, durations, and descriptions. Only accept bookings for treatments that are on the spa menu. If a guest requests something not on the menu, politely inform them and suggest similar alternatives, or offer to escalate for special requests.

HOTEL FACILITY HOURS:
${JSON.stringify(activityHours, null, 2)}

UPCOMING EVENTS (All Free for Hotel Guests):
${JSON.stringify(upcomingEvents, null, 2)}

WIFI CREDENTIALS:
- Network Name: SmartHotel_Guest
- Password: Welcome2024!Luxury
- Available in all areas of the hotel

Remember: You represent a luxury hotel brand. Be attentive, responsive, and make every guest feel valued.`,
  tools: [
    roomServiceTool, 
    housekeepingTool, 
    extraEquipmentTool, 
    spaTool, 
    taxiTool, 
    activityHoursTool, 
    eventsTool, 
    wifiTool, 
    escalationTool
  ],
});

export { 
  roomServiceTool, 
  housekeepingTool, 
  extraEquipmentTool, 
  spaTool, 
  taxiTool, 
  activityHoursTool, 
  eventsTool, 
  wifiTool, 
  escalationTool 
};

