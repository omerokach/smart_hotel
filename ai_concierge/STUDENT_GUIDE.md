# AI Concierge - Student Guide 🎓

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Core Technologies](#3-core-technologies)
4. [Project Structure](#4-project-structure)
5. [The AI Agent (OpenAI Agents SDK)](#5-the-ai-agent-openai-agents-sdk)
   - [What is an AI Agent?](#what-is-an-ai-agent)
   - [How the Agent Works Internally (The Run Loop)](#how-the-agent-works-internally-the-run-loop) ⭐
   - [How Does the LLM Know Which Tool to Use?](#how-does-the-llm-know-which-tool-to-use)
   - [Multi-Turn Conversations](#multi-turn-conversations)
   - [Tool Execution Tracking](#tool-execution-tracking)
6. [Tools System](#6-tools-system)
7. [Server & API Layer](#7-server--api-layer)
8. [Session Management](#8-session-management)
9. [Escalation Flow](#9-escalation-flow)
10. [External Integrations](#10-external-integrations)
11. [Data Flow Example](#11-data-flow-example)
12. [How to Run](#12-how-to-run)

---

## 1. Project Overview

The **AI Concierge** is an intelligent chatbot for a smart hotel. It helps guests with:
- 🍽️ **Room Service** - Order food and drinks
- 🧹 **Housekeeping** - Request room cleaning
- 💆 **Spa Booking** - Schedule spa treatments
- 🚕 **Taxi Orders** - Book transportation
- 📦 **Extra Equipment** - Request amenities (towels, pillows, etc.)
- ⏰ **Activity Hours** - Get facility schedules
- 🎉 **Events** - View upcoming hotel events
- 📶 **WiFi** - Get network credentials
- 🆘 **Escalation** - Connect to human staff for complex issues

The system uses **OpenAI's GPT model** with custom tools to handle these requests automatically, and creates tasks in an external task management API.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GUEST FRONTEND                                  │
│                         (public/concierge.html)                              │
│                    HTML + JavaScript Chat Interface                          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTP POST /api/chat
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS SERVER (server.ts)                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │ Session Manager │    │  CORS Middleware │    │ Static Files    │          │
│  │ (In-memory Map) │    │                  │    │ (public/)       │          │
│  └────────┬────────┘    └──────────────────┘    └─────────────────┘          │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                       AI AGENT (agent.ts)                        │        │
│  │  ┌──────────────────────────────────────────────────────────┐   │        │
│  │  │                   OpenAI Agents SDK                       │   │        │
│  │  │  - Model: gpt-4o-mini                                    │   │        │
│  │  │  - System Instructions (personality, rules, menus)       │   │        │
│  │  │  - 8 Custom Tools                                        │   │        │
│  │  └──────────────────────────────────────────────────────────┘   │        │
│  │                              │                                   │        │
│  │     ┌────────────────────────┼────────────────────────┐         │        │
│  │     ▼           ▼            ▼          ▼             ▼         │        │
│  │ ┌────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌───────────┐    │        │
│  │ │Room    │ │House-   │ │  Spa    │ │  Taxi  │ │ Escalation│    │        │
│  │ │Service │ │keeping  │ │ Booking │ │ Order  │ │ (Human)   │    │        │
│  │ └────────┘ └─────────┘ └─────────┘ └────────┘ └───────────┘    │        │
│  │ ┌────────┐ ┌─────────┐ ┌─────────┐                              │        │
│  │ │Extra   │ │Activity │ │ Events  │                              │        │
│  │ │Equip.  │ │ Hours   │ │         │                              │        │
│  │ └────────┘ └─────────┘ └─────────┘                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                              │                                               │
│           ┌──────────────────┴──────────────────┐                           │
│           ▼                                      ▼                           │
│  ┌─────────────────┐                    ┌─────────────────┐                 │
│  │ Tool Execution  │                    │ Session Context │                 │
│  │ Tracker         │                    │ (Room Number)   │                 │
│  └────────┬────────┘                    └─────────────────┘                 │
└───────────┼─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL TASK API                                     │
│            https://smart-hotel-tasks-api.onrender.com                        │
│                                                                              │
│  POST /api/tasks         → Create new task (room service, spa, etc.)        │
│  POST /api/tasks/:id/messages → Save chat messages (for escalation)         │
│  GET  /api/tasks/:id/messages → Fetch staff replies                         │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACK OFFICE (staff view)                              │
│                    ../back_office/messages.html                              │
│              Staff can view escalated chats and reply                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Technologies

| Technology | Purpose | File(s) |
|------------|---------|---------|
| **TypeScript** | Type-safe JavaScript | All `.ts` files |
| **OpenAI Agents SDK** | AI agent framework | `agent.ts` |
| **Express.js** | Web server & API | `server.ts` |
| **Zod** | Schema validation for tools | All tool files |
| **Google APIs** | Calendar invites for spa | `integrations/googleCalendar.ts` |
| **chrono-node** | Natural language date parsing | `googleCalendar.ts` |

### Why These Technologies?

1. **OpenAI Agents SDK** (`@openai/agents`) - A framework specifically designed for building AI agents with:
   - Tool calling capabilities
   - Conversation management
   - Easy integration with OpenAI models

2. **TypeScript** - Provides type safety, better IDE support, and catches errors at compile time

3. **Zod** - Validates the parameters that the AI passes to tools, ensuring type safety

---

## 4. Project Structure

```
ai_concierge/
├── src/
│   ├── agent.ts                 # 🤖 Main AI agent definition
│   ├── server.ts                # 🌐 Express web server
│   ├── types.ts                 # 📝 TypeScript interfaces
│   ├── sessionContext.ts        # 🔑 Room number context
│   ├── toolExecutionTracker.ts  # 📊 Tracks when tools execute
│   │
│   ├── tools/                   # 🛠️ Tool implementations
│   │   ├── roomService.ts       # 🍽️ Food ordering
│   │   ├── housekeeping.ts      # 🧹 Room cleaning
│   │   ├── spa.ts               # 💆 Spa bookings
│   │   ├── taxi.ts              # 🚕 Transportation
│   │   ├── extraEquipment.ts    # 📦 Amenities
│   │   ├── activityHours.ts     # ⏰ Facility hours
│   │   ├── events.ts            # 🎉 Hotel events
│   │   ├── wifi.ts              # 📶 WiFi credentials
│   │   └── escalation.ts        # 🆘 Human handoff
│   │
│   ├── integrations/
│   │   └── googleCalendar.ts    # 📅 Google Calendar API
│   │
│   └── data/                    # 📋 Static data files
│       ├── menu.json            # Room service menu
│       ├── spa-menu.json        # Spa treatments
│       ├── activity-hours.json  # Facility schedules
│       └── events.json          # Upcoming events
│
├── public/                      # 🖥️ Frontend files
│   ├── index.html               # Login page
│   ├── concierge.html           # Chat interface
│   └── js/index.js              # Login logic
│
├── package.json                 # 📦 Dependencies
└── tsconfig.json                # ⚙️ TypeScript config
```

---

## 5. The AI Agent (OpenAI Agents SDK)

### What is an AI Agent?

An AI Agent is an AI that can:
1. **Understand** natural language requests
2. **Decide** which actions (tools) to take
3. **Execute** those tools with correct parameters
4. **Respond** based on the results

### Agent Definition (`agent.ts`)

```typescript
import { Agent, tool } from '@openai/agents';

export const hotelConciergeAgent = new Agent({
  name: 'Hotel Concierge Assistant',
  model: 'gpt-4o-mini',  // The LLM model
  instructions: `...`,    // System prompt (personality, rules)
  tools: [                // Available capabilities
    roomServiceTool, 
    housekeepingTool, 
    spaTool,
    // ... more tools
  ],
});
```

### Key Components:

| Component | Description |
|-----------|-------------|
| `name` | Identifier for the agent |
| `model` | Which OpenAI model to use (`gpt-4o-mini` is cheaper for demos) |
| `instructions` | System prompt that defines personality, rules, menus, and conversation flows |
| `tools` | Array of tools the agent can call |

### The Instructions (System Prompt)

The `instructions` field is a **massive string** (~10KB) that tells the AI:
1. **Personality**: "Professional and friendly hotel concierge"
2. **Formatting Rules**: No markdown, use emojis, plain text only
3. **Conversation Flows**: Step-by-step scripts for each service
4. **Data**: Menu items, prices, facility hours, events

Example from the instructions:
```
🍽️ ROOM SERVICE TOOL FLOW:
1. Opening: "Hello! Welcome to our Room Service..."
2. Guest selects items
3. Ask for special requests
4. Guest responds
5. Confirm: "Let me confirm your order..."
6. Guest confirms
7. Execute roomServiceTool
8. Final: "Perfect! Your order has been placed..."
```

### How the Agent Works Internally (The Run Loop)

This is the **most important concept** to understand. When you call `run(agent, message)`, here's what happens:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE AGENT RUN LOOP (Agentic Loop)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   User Message      │
                    │  "I want pizza"     │
                    └──────────┬──────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Send to LLM (GPT-4o-mini)                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  System Prompt (instructions) + User Message + Tool Definitions        │ │
│  │                                                                         │ │
│  │  The LLM receives:                                                      │ │
│  │  - WHO it is (hotel concierge personality)                             │ │
│  │  - WHAT tools it has (room service, spa, taxi, etc.)                   │ │
│  │  - HOW to use each tool (parameter schemas)                            │ │
│  │  - WHAT the user said                                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: LLM Makes a Decision                                                │
│                                                                              │
│  The LLM looks at the message and decides:                                   │
│                                                                              │
│  Option A: "I need more info" → Just respond with text                       │
│            Example: "What size pizza would you like?"                        │
│                                                                              │
│  Option B: "I have all info, time to act" → Call a tool                      │
│            Example: Call order_room_service with { items: ["Large Pizza"] }  │
│                                                                              │
│  Option C: "I can't handle this" → Call escalate_to_human                    │
└──────────────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼───────┐     ┌───────▼───────┐
            │  No Tool Call │     │  Tool Call    │
            │  (just text)  │     │  Requested    │
            └───────┬───────┘     └───────┬───────┘
                    │                     │
                    │                     ▼
                    │     ┌──────────────────────────────────────────────────┐
                    │     │  STEP 3: SDK Executes the Tool                   │
                    │     │                                                  │
                    │     │  const result = await tool.execute({             │
                    │     │    items: ["Large Pizza"],                       │
                    │     │    specialInstructions: null                     │
                    │     │  });                                             │
                    │     │                                                  │
                    │     │  → Our code runs (orderRoomService function)     │
                    │     │  → Returns: { items, estimatedTime: "20-30min" } │
                    │     └──────────────────────────────────────────────────┘
                    │                     │
                    │                     ▼
                    │     ┌──────────────────────────────────────────────────┐
                    │     │  STEP 4: Send Tool Result Back to LLM            │
                    │     │                                                  │
                    │     │  LLM sees: "Tool executed successfully,          │
                    │     │            result: { estimatedTime: '20-30min' }"│
                    │     │                                                  │
                    │     │  LLM generates final response:                   │
                    │     │  "Your pizza is on its way! 🍕                   │
                    │     │   Expected delivery: 20-30 minutes"              │
                    │     └──────────────────────────────────────────────────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Final Response    │
                    │  returned to user   │
                    └─────────────────────┘
```

### The Code: `run()` Function

In `server.ts`, this is how we invoke the agent:

```typescript
import { run } from '@openai/agents';
import { hotelConciergeAgent } from './agent.js';

// Inside the /api/chat endpoint:
const result = await run(hotelConciergeAgent, messageWithContext);

// result.finalOutput contains the AI's text response
res.json({ response: result.finalOutput });
```

The `run()` function from OpenAI Agents SDK handles the entire loop:
1. Sends message + tools to OpenAI API
2. If LLM requests a tool call → executes it
3. Sends tool result back to LLM
4. Repeats until LLM gives a final text response
5. Returns `result.finalOutput`

### How Does the LLM Know Which Tool to Use?

The LLM is given **tool definitions** in a specific format:

```json
{
  "name": "order_room_service",
  "description": "Order food and drinks to be delivered to the guest room. 
                  Use this when guests want to order meals, snacks, or beverages.",
  "parameters": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of food/drink items to order"
      },
      "specialInstructions": {
        "type": "string",
        "description": "Any special requests or dietary restrictions"
      }
    },
    "required": ["items"]
  }
}
```

The LLM uses:
1. **Tool name** - Semantic meaning (order_room_service = ordering food)
2. **Description** - When to use it ("when guests want to order meals")
3. **Parameter descriptions** - What values to extract from conversation
4. **Conversation context** - What the user has said so far

### Multi-Turn Conversations

Since the LLM is stateless (no memory between requests), we pass **conversation history**:

```typescript
// In server.ts
const recentHistory = session.messages.slice(-5, -1);
let contextPrefix = "[Previous conversation context:\n";
recentHistory.forEach(msg => {
  const role = msg.role === 'user' ? 'Guest' : 'Agent';
  contextPrefix += `${role}: ${msg.content}\n`;
});
contextPrefix += "]\n\nGuest's current message: ";

const messageWithContext = contextPrefix + message;
const result = await run(hotelConciergeAgent, messageWithContext);
```

This way, the LLM knows:
- What the guest said before
- What the agent already asked
- The current state of the conversation

### Tool Execution Tracking

We need to know **when** a tool was executed (to create tasks). The OpenAI SDK doesn't directly tell us, so we use a tracker:

```typescript
// toolExecutionTracker.ts
let lastServiceToolExecution = null;

export function trackServiceToolExecution(toolName, args, result) {
  lastServiceToolExecution = { toolName, args, result, timestamp: Date.now() };
  console.log('🔔 Service tool executed:', toolName);
}

export function getAndClearLastServiceToolExecution() {
  const execution = lastServiceToolExecution;
  lastServiceToolExecution = null;  // Clear after reading
  return execution;
}
```

Each tool calls `trackServiceToolExecution()` when it runs:

```typescript
// In roomService.ts
export async function orderRoomService(params) {
  trackServiceToolExecution('order_room_service', params);  // ← Track!
  // ... process order ...
  return order;
}
```

Then the server checks:

```typescript
// In server.ts, after run() completes
const serviceExecution = getAndClearLastServiceToolExecution();
if (serviceExecution) {
  // A tool was called! Create a task in the external API
  await createTask(serviceExecution);
}
```

### Summary: The Agent Intelligence

The "magic" of AI agents comes from:

| Component | Role |
|-----------|------|
| **LLM (GPT-4)** | Understands language, decides actions, generates responses |
| **System Prompt** | Defines personality, rules, available data (menus, hours) |
| **Tools** | Structured actions the AI can take (with validated parameters) |
| **Conversation History** | Gives context for multi-turn dialogs |
| **Run Loop** | Orchestrates the back-and-forth between LLM and tools |

The AI isn't "programmed" with if/else logic. Instead:
- It **learns** from the instructions what kind of assistant it should be
- It **decides** based on the conversation which tool (if any) to call
- It **extracts** parameters from natural language automatically
- It **generates** human-like responses based on tool results

---

## 6. Tools System

### What is a Tool?

A **tool** is a function that the AI agent can call to perform an action. Each tool has:

1. **Name**: Identifier (e.g., `order_room_service`)
2. **Description**: What it does (helps AI decide when to use it)
3. **Parameters**: Schema defining required/optional inputs
4. **Execute Function**: The actual code that runs

### Tool Definition Example (`roomService.ts`)

```typescript
import { z } from 'zod';
import { tool } from '@openai/agents';

// 1. Define parameter schema with Zod
export const roomServiceSchema = z.object({
  items: z.array(z.string()).describe('List of food/drink items'),
  specialInstructions: z.string().optional().nullable(),
});

// 2. Define the execute function
export async function orderRoomService(params) {
  console.log('🍽️ Processing room service order...', params);
  
  // In production: call hotel's POS system
  return {
    items: params.items,
    specialInstructions: params.specialInstructions,
    estimatedTime: '20-30 minutes',
  };
}

// 3. Create the tool (in agent.ts)
const roomServiceTool = tool({
  name: 'order_room_service',
  description: 'Order food and drinks to guest room',
  parameters: roomServiceSchema,
  execute: orderRoomService,
});
```

### All Tools Overview

| Tool | Purpose | Creates Task? |
|------|---------|---------------|
| `order_room_service` | Order food/drinks | ✅ Yes |
| `request_housekeeping` | Room cleaning | ✅ Yes |
| `book_spa_appointment` | Spa treatments | ✅ Yes |
| `order_taxi` | Transportation | ✅ Yes |
| `request_extra_equipment` | Amenities | ✅ Yes |
| `get_activity_hours` | Facility hours | ❌ No (info only) |
| `get_upcoming_events` | Hotel events | ❌ No (info only) |
| `get_wifi_password` | WiFi credentials | ❌ No (info only) |
| `escalate_to_human` | Human handoff | ✅ Yes (special) |

---

## 7. Server & API Layer

### Express Server (`server.ts`)

The server handles:
1. **Static files** - Serves the frontend (`public/` folder)
2. **Chat API** - Processes guest messages
3. **Session management** - Tracks conversation state
4. **Task creation** - Creates tasks when tools execute
5. **Message polling** - For escalated conversations

### Main Endpoint: `POST /api/chat`

```typescript
app.post('/api/chat', async (req, res) => {
  const { message, sessionId, roomNumber } = req.body;
  
  // 1. Get or create session
  // 2. Add user message to history
  // 3. Check if escalated → relay to staff
  // 4. Otherwise → run AI agent
  // 5. Check if tool was executed → create task
  // 6. Return response
});
```

### Request/Response Flow:

```
Frontend → POST /api/chat
{
  message: "I want to order pizza",
  sessionId: "abc123",
  roomNumber: "205"
}

Server → Response
{
  response: "What size pizza would you like?",
  sessionId: "abc123",
  chatEnded: false,
  taskId: null
}
```

When a service tool executes:
```
{
  response: "Your order has been placed!",
  sessionId: "abc123",
  chatEnded: true,      // Chat ends after service
  taskId: 42            // Task created in API
}
```

---

## 8. Session Management

### Session State

Each conversation has a **session** stored in a Map:

```typescript
interface Session {
  messages: Array<{ role: string; content: string }>;  // Chat history
  escalated: boolean;           // Is human involved?
  taskId: number | null;        // Escalation task ID
  lastMessageCheck: Date | null;// For polling staff messages
  roomNumber: string;           // Guest's room
  guestEmail?: string | null;   // For calendar invites
  guestName?: string | null;    // Guest name
}

const sessions = new Map<string, Session>();
```

### Session Context (`sessionContext.ts`)

A simple way to pass the room number to tools:

```typescript
let currentRoomNumber: string = '103';

export function setCurrentRoomNumber(roomNumber: string): void {
  currentRoomNumber = roomNumber;
}

export function getCurrentRoomNumber(): string {
  return currentRoomNumber;
}
```

Tools call `getCurrentRoomNumber()` to know which room the request is for.

---

## 9. Escalation Flow

### What is Escalation?

When the AI **cannot** handle a request (complaints, billing, technical issues), it **escalates** to a human staff member.

### The Flow:

```
Guest: "My TV is broken"
           │
           ▼
┌──────────────────────────────┐
│ AI recognizes: can't fix TV  │
│ → Calls escalate_to_human    │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ escalation.ts:               │
│ 1. Creates task in API       │
│ 2. Returns task ID           │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ server.ts:                   │
│ 1. Detects escalation        │
│ 2. Marks session.escalated   │
│ 3. Saves chat history to API │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Response to guest:           │
│ "We got your message and     │
│  we'll reach out soon!"      │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Staff sees in Back Office    │
│ Staff replies → Guest sees   │
│ Guest replies → Staff sees   │
│ (bidirectional chat)         │
└──────────────────────────────┘
```

### Key Code:

```typescript
// In server.ts - after AI responds
if (escalationExecution && escalationExecution.result?.taskId) {
  session.escalated = true;
  session.taskId = escalatedTaskId;
  
  // Save conversation history to task
  for (const msg of session.messages) {
    await saveMessageToTask(taskId, 'guest', msg.content);
  }
}
```

---

## 10. External Integrations

### 1. Task Management API

All service requests create tasks in an external API:

```typescript
const API_URL = 'https://smart-hotel-tasks-api.onrender.com';

// Create task
await fetch(`${API_URL}/api/tasks`, {
  method: 'POST',
  body: JSON.stringify({
    room_number: "205",
    request_type: "Room Service",
    assigned_department: "Restaurant",
    status: "open",
    priority: "Normal",
    request_details: "Caesar Salad, no croutons",
    opening_channel: "app"
  })
});
```

### 2. Google Calendar Integration

For spa bookings, the system can send calendar invites:

```typescript
// integrations/googleCalendar.ts
export async function sendSpaCalendarInvite(details) {
  // Uses Google Calendar API to create an event
  // and invite the guest via email
}
```

Required environment variables:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `SPA_CALENDAR_ID`

---

## 11. Data Flow Example

### Complete Flow: Guest Orders Room Service

```
1. Guest opens chat (concierge.html)
   → localStorage has room "205"

2. Guest: "I want to order food"
   → POST /api/chat { message: "I want to order food", roomNumber: "205" }

3. Server creates/gets session
   → sessions.set("session123", { roomNumber: "205", ... })

4. Server runs AI agent
   → run(hotelConciergeAgent, messageWithContext)

5. AI responds with menu (no tool called yet)
   → "Here's our menu: 🍳 Breakfast..."

6. Guest: "Caesar salad please"
   → POST /api/chat { message: "Caesar salad please" }

7. AI asks about special instructions
   → "Would you like any special instructions?"

8. Guest: "No croutons"
   → POST /api/chat

9. AI confirms
   → "Caesar Salad, no croutons. $16. Confirm?"

10. Guest: "Yes"
    → POST /api/chat

11. AI executes order_room_service tool
    → trackServiceToolExecution('order_room_service', { items: ['Caesar Salad'], specialInstructions: 'no croutons' })

12. Server detects tool execution
    → serviceExecution = getAndClearLastServiceToolExecution()

13. Server creates task in external API
    → POST https://smart-hotel-tasks-api.onrender.com/api/tasks

14. Server responds
    → { response: "Order placed!", chatEnded: true, taskId: 42 }

15. Frontend shows confirmation
    → Chat ends, guest sees order confirmation
```

---

## 12. How to Run

### Prerequisites
- Node.js 18+
- OpenAI API key

### Setup

```bash
# 1. Navigate to ai_concierge folder
cd ai_concierge

# 2. Install dependencies
npm install

# 3. Create .env file
echo "OPENAI_API_KEY=your_key_here" > .env

# 4. Run in development mode
npm run web

# 5. Open browser
# http://localhost:3000
```

### Build for Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Run production server
npm start
```

---

## Summary: Key Concepts for Your Presentation

1. **OpenAI Agents SDK** - Framework for building AI agents with tools
2. **Tool Pattern** - Functions the AI can call with validated parameters (Zod schemas)
3. **Conversation State** - Session management with history for multi-turn dialogs
4. **Escalation** - Handoff mechanism from AI to human when needed
5. **Task Creation** - Integration with external task API for operations
6. **Prompt Engineering** - Detailed instructions that control AI behavior

### Questions to Prepare For:

1. "How does the AI know which tool to use?"
   → Based on the tool descriptions and the context of the conversation

2. "What happens if the AI makes a mistake?"
   → Escalation to human staff + parameter validation with Zod

3. "Is the conversation state persisted?"
   → Currently in-memory (Map), would use database in production

4. "How do you prevent the AI from hallucinating menus?"
   → Real data is embedded in the system prompt (menu.json, etc.)

5. "Why TypeScript instead of JavaScript?"
   → Type safety, better IDE support, catches errors early

---

Good luck with your presentation! 🎓

