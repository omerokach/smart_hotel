# 🏗️ Architecture Guide - Smart Hotel AI Concierge

## System Overview

This application uses the OpenAI Agents SDK to create an intelligent hotel concierge that automatically routes guest requests to the appropriate service tools.

```
┌─────────────────────────────────────────────────────────────┐
│                         Guest Input                         │
│               (Web UI / CLI / API Request)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Agent (GPT-4o)                         │
│  - Understands natural language                             │
│  - Determines intent                                        │
│  - Selects appropriate tool(s)                              │
│  - Extracts parameters                                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │   Tool Selection      │
                └───────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│ Room Service │    │ Housekeeping │   │  Spa Booking │
│     Tool     │    │     Tool     │   │     Tool     │
└──────┬───────┘    └──────┬───────┘   └──────┬───────┘
       │                   │                   │
       ├──────────────┬────┼──────────────┬────┴───────────┐
       ▼              ▼    ▼              ▼                ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌─────────┐
│   Taxi Tool  ││ Extra Equip. ││ Activity Hrs ││   Events     ││ WiFi    │
└──────────────┘└──────────────┘└──────────────┘└──────────────┘└─────────┘
       │
       ▼
┌──────────────┐
│ Escalation   │
└──────────────┘
```

## Key Components

### 1. Agent (`src/agent.ts`)

The core AI agent that:
- Receives guest messages
- Understands intent using natural language
- Automatically selects and calls appropriate tools
- Manages conversation flow
- Returns formatted responses

**Key Features**:
- Built on GPT-4o for best understanding
- Configured with hotel-specific instructions
- Has access to all service tools
- Maintains professional, helpful tone

### 2. Tools (`src/tools/`)

Each tool represents a hotel service:

#### Tool Structure
```typescript
1. Schema Definition (Zod)
   - Defines required parameters
   - Includes descriptions for AI understanding
   - Validates input types

2. Execution Function
   - Processes the service request
   - Returns structured response
   - Can integrate with backend systems

3. Tool Registration
   - Wraps schema + function
   - Provides clear description
   - Registers with agent
```

#### Available Tools

- **Room Service** (`roomService.ts`): Orders food and beverages
- **Housekeeping** (`housekeeping.ts`): Cleaning/turndown scheduling
- **Spa Booking** (`spa.ts`): Spa treatments (with Google Calendar invite helper)
- **Taxi** (`taxi.ts`): Transportation bookings (destination/time/passengers/notes)
- **Extra Equipment** (`extraEquipment.ts`): Towels, blankets, toiletries, pillows, hangers, etc.
- **Activity Hours** (`activityHours.ts`): Facility hours lookup
- **Events** (`events.ts`): Upcoming complimentary events
- **WiFi** (`wifi.ts`): Always-on WiFi credentials
- **Escalation** (`escalation.ts`): Handoff to a human representative
- **Google Calendar integration** (`integrations/googleCalendar.ts`): Uses `chrono-node` + `luxon` to parse guest-preferred times and create invites via OAuth2 or service account

### 3. Interfaces

#### CLI Interface (`src/chat-cli.ts`)
- Terminal-based chat
- Real-time interaction
- Shows tool usage
- Great for testing and debugging

#### Web Interface (`src/server.ts` + `public/index.html`)
- REST API backend
- Beautiful chat UI
- Session management
- Production-ready foundation

## How Tool Selection Works

### The Magic of Automatic Tool Selection

The OpenAI Agents SDK automatically determines which tool to use based on:

1. **Tool Descriptions**: Clear, specific descriptions tell the AI when to use each tool
2. **Parameter Schemas**: Zod schemas with descriptions help the AI understand what information is needed
3. **Context**: The AI considers the full conversation context
4. **User Intent**: Natural language understanding identifies the guest's goal

### Example Flow

**Guest Says**: "I want to order a burger to room 305"

1. **Agent analyzes** the message
2. **Identifies intent**: Food order → Room Service
3. **Extracts parameters**:
   - roomNumber: "305"
   - items: ["burger"]
4. **Calls** `order_room_service` tool
5. **Receives** order confirmation
6. **Responds** to guest with details

### Why This Approach Works

✅ **No keyword matching** - Understands natural language variations
✅ **Context-aware** - Considers conversation history
✅ **Handles ambiguity** - Asks clarifying questions when needed
✅ **Flexible** - Works with any phrasing
✅ **Extensible** - Easy to add new tools

## Data Flow

### Request Processing

```typescript
1. User Input
   ↓
2. run(agent, message)
   ↓
3. Agent analyzes message
   ↓
4. Tool selection & parameter extraction
   ↓
5. Tool execution
   ↓
6. Result processing
   ↓
7. Natural language response
   ↓
8. Return to user
```

### Tool Execution Cycle

```typescript
// The agent can call multiple tools in one request
while (agent needs more information) {
  1. Call tool with parameters
  2. Receive structured result
  3. Process result
  4. Determine if more tools needed
}

// Finally, generate response
return natural_language_response
```

## Security Architecture

### Input Validation

```typescript
// Every tool uses Zod for validation
const schema = z.object({
  roomNumber: z.string(),  // Type validation
  quantity: z.number().min(1).max(20),  // Range validation
});

// Invalid input is rejected before execution
```

### Secrets Management

```typescript
// ✅ Good: Environment variables
const apiKey = process.env.OPENAI_API_KEY;

// ❌ Bad: Hardcoded (never do this)
// const apiKey = "sk-...";
```

### Safe Execution

- All tool parameters validated
- No SQL injection risk (using safe patterns)
- No command injection (no shell execution)
- Proper error handling

## Extending the System

### Adding a New Tool

1. **Create tool file** in `src/tools/newService.ts`:
```typescript
import { z } from 'zod';

// 1. Define schema
export const newServiceSchema = z.object({
  roomNumber: z.string().describe('Guest room number'),
  // ... other parameters
});

// 2. Implement function
export async function executeNewService(
  params: z.infer<typeof newServiceSchema>
) {
  // Your logic here
  return result;
}
```

2. **Register tool** in `src/agent.ts`:
```typescript
import { tool } from '@openai/agents';
import { executeNewService, newServiceSchema } from './tools/newService.js';

const newServiceTool = tool({
  name: 'new_service_name',
  description: 'Clear description of when to use this tool',
  parameters: newServiceSchema,
  execute: executeNewService,
});

// Add to agent
const agent = new Agent({
  // ...
  tools: [...existingTools, newServiceTool],
});
```

3. **Test** the new tool:
```bash
npm run chat
# Try: "I need [your new service]"
```

### Integrating Real Backend Systems

Replace mock implementations with real API calls:

```typescript
// Before (mock)
export async function orderRoomService(params) {
  return { orderId: 'mock-123', estimatedTime: '30 minutes' };
}

// After (real integration)
export async function orderRoomService(params) {
  const response = await fetch('https://hotel-pms.example.com/api/orders', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.PMS_API_KEY}` },
    body: JSON.stringify(params),
  });
  return await response.json();
}
```

## Performance Considerations

### API Calls

- Each user message = 1+ OpenAI API calls
- Tool executions = additional backend calls
- Consider caching for repeated information

### Latency

Typical response time breakdown:
- Network to OpenAI: 50-200ms
- Model processing: 500-2000ms
- Tool execution: 100-1000ms
- Total: 1-3 seconds

### Cost Optimization

- Use appropriate model (gpt-4o for accuracy, gpt-3.5-turbo for cost)
- Implement caching for static information
- Set token limits to control costs
- Monitor usage via OpenAI dashboard

## Monitoring & Debugging

### Built-in Tracing

The SDK includes tracing capabilities (see docs for setup).

### Logging Tool Calls

```typescript
const result = await run(agent, message);

// Log what happened
console.log('Tools used:', result.toolCalls.map(t => t.name));
console.log('Parameters:', result.toolCalls.map(t => t.parameters));
```

### Error Handling

```typescript
try {
  const result = await run(agent, message);
} catch (error) {
  if (error instanceof Error) {
    console.error('Agent error:', error.message);
  }
  // Handle gracefully
}
```

## Production Deployment

### Checklist

- [ ] Environment variables properly configured
- [ ] Rate limiting implemented
- [ ] Authentication/authorization added
- [ ] Error logging configured
- [ ] Database for session persistence
- [ ] Monitoring and alerts set up
- [ ] Load testing completed
- [ ] Security audit performed

### Scaling Considerations

- **Horizontal Scaling**: Stateless design allows multiple instances
- **Session Storage**: Use Redis or database for distributed sessions
- **Caching**: Cache static responses and hotel information
- **Queue System**: Use queues for long-running operations

---

This architecture provides a solid foundation for building production-ready hotel AI agents. The modular design makes it easy to add services, integrate with existing systems, and scale as needed.
