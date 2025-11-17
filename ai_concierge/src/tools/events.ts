import { z } from 'zod';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load events data
let eventsData: any = null;
export function getEvents() {
  if (!eventsData) {
    const dataPath = join(__dirname, '../data/events.json');
    eventsData = JSON.parse(readFileSync(dataPath, 'utf-8'));
  }
  return eventsData;
}

// Tool-specific behavioral instructions
export const eventsInstructions = `
EVENTS TOOL - EXACT CONVERSATION FLOW:

1. Opening: "Hello! Welcome to our event schedule. I would be happy to tell you about the upcoming complimentary activities at the hotel."
2. Immediately execute eventsTool and display ALL events with:
   • Event emoji (🧘 🎭 🎨 🎵 etc.)
   • Event name
   • Date, Time, Location
   • Description
   • Price (always "Free for hotel guests")
3. Final: "To secure your place at any of these events, registration is required and can be completed at the Front Desk. Would you like to ask about a specific event or do you have another request? Have a wonderful day and enjoy your stay with us!"

FORMATTING:
- Use plain text with emojis and bullet points (•)
- NO markdown syntax (**, ---, ##)
- Keep formatting clean and scannable

CRITICAL: This is an information tool - execute immediately and show all data.
`;

export const eventsSchema = z.object({
  eventType: z.string().optional().nullable().describe('Type of event to filter (e.g., "concert", "yoga", "workshop", "lecture") or leave empty for all events'),
  day: z.string().optional().nullable().describe('Specific day to filter (e.g., "Monday", "Sunday", "today", "tomorrow") or leave empty for all days'),
});

export async function getUpcomingEvents(params: z.infer<typeof eventsSchema>): Promise<any> {
  console.log('🎭 Retrieving upcoming events...', params);
  
  const data = getEvents();
  let filteredEvents = data.events;
  
  // Filter by event type if specified
  if (params.eventType) {
    const eventType = params.eventType.toLowerCase();
    filteredEvents = filteredEvents.filter((event: any) => 
      event.type.toLowerCase().includes(eventType) || 
      event.name.toLowerCase().includes(eventType)
    );
  }
  
  // Filter by day if specified
  if (params.day) {
    const day = params.day.toLowerCase();
    filteredEvents = filteredEvents.filter((event: any) => 
      event.day.toLowerCase().includes(day) ||
      event.date.toLowerCase().includes(day)
    );
  }
  
  return {
    totalEvents: filteredEvents.length,
    events: filteredEvents,
    note: 'All events are free of charge for hotel guests',
  };
}

