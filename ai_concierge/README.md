# 🏨 Smart Hotel AI Concierge

An intelligent hotel customer service agent built with the [OpenAI Agents SDK](https://openai.github.io/openai-agents-js). This AI-powered concierge helps hotel guests with room service, housekeeping, towel requests, and spa bookings through a natural conversational interface.

## ✨ Features

- **🤖 AI-Powered Concierge**: Natural language understanding powered by GPT-4o
- **🛠️ Intelligent Tool Selection**: Automatically detects and uses the right tool based on guest requests
- **💬 Multiple Interfaces**: 
  - CLI chat for testing
  - Beautiful web-based chat UI
  - REST API for integration
- **🎯 Hotel Services**:
  - **Room Service**: Order food and beverages
  - **Housekeeping**: Request room cleaning (full-clean, quick-tidy, turndown)
  - **Towels**: Request additional towels (bath, hand, pool, or assorted)
  - **Spa Booking**: Schedule spa treatments and appointments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone or navigate to the project directory**:
```bash
cd smartHotel
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-api-key-here
```

Alternatively, export it directly:
```bash
export OPENAI_API_KEY=sk-your-api-key-here
```

### Running the Application

#### Option 1: Web Interface (Recommended)

Start the web server:
```bash
npm run web
```

Then open your browser to: **http://localhost:3000**

#### Option 2: CLI Chat Interface

For a terminal-based chat:
```bash
npm run chat
```

#### Option 3: Simple Demo

Run a single example interaction:
```bash
npm run dev
```

## 🎮 Usage Examples

### Example Conversations

**Room Service**:
```
Guest: "Hi, I'd like to order room service. I'm in room 305 and want a cheeseburger, fries, and a coke."
Agent: "Certainly! I'll place that order for you right away..."
```

**Housekeeping**:
```
Guest: "Can someone clean my room? I'm in 412."
Agent: "Of course! What type of cleaning would you prefer? We offer full-clean, quick-tidy, or turndown service."
```

**Towels**:
```
Guest: "I need more towels in room 208."
Agent: "I'd be happy to help! How many towels would you like, and what type?"
```

**Spa Booking**:
```
Guest: "I want to book a massage for tomorrow afternoon. Room 501."
Agent: "Wonderful! What time would work best for you tomorrow afternoon?"
```

## 🏗️ Project Structure

```
smartHotel/
├── src/
│   ├── agent.ts                      # Main AI agent configuration
│   ├── index.ts                      # Simple demo entry point
│   ├── chat-cli.ts                   # CLI chat interface
│   ├── server.ts                     # Web server with REST API
│   ├── types.ts                      # TypeScript type definitions
│   ├── RESPONSE_FORMATTING_GUIDE.md  # Agent response formatting guidelines
│   ├── data/                         # JSON data files
│   │   ├── menu.json                 # Room service menu
│   │   ├── spa-menu.json             # Spa treatments menu
│   │   ├── events.json               # Hotel events
│   │   └── activity-hours.json       # Facility hours
│   └── tools/
│       ├── roomService.ts            # Room service tool
│       ├── housekeeping.ts           # Housekeeping tool
│       ├── extraEquipment.ts         # Extra equipment/towels tool
│       ├── spa.ts                    # Spa booking tool
│       ├── taxi.ts                   # Taxi ordering tool
│       ├── activityHours.ts          # Facility hours tool
│       ├── events.ts                 # Events information tool
│       ├── wifi.ts                   # WiFi credentials tool
│       └── escalation.ts             # Human escalation tool
├── public/
│   └── index.html                    # Web chat UI
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 How It Works

### 1. Tools Definition

Each hotel service is defined as a **tool** with:
- A Zod schema for parameter validation
- An execution function that processes the request
- Clear descriptions for the AI to understand when to use it

Example from `roomService.ts`:
```typescript
const roomServiceSchema = z.object({
  roomNumber: z.string().describe('The guest room number'),
  items: z.array(z.string()).describe('List of food/drink items'),
  specialInstructions: z.string().optional(),
});

const roomServiceTool = tool({
  name: 'order_room_service',
  description: 'Order food and drinks to be delivered to the guest room.',
  parameters: roomServiceSchema,
  execute: orderRoomService,
});
```

### 2. Agent Configuration

The agent is configured with:
- Clear instructions on how to behave
- All available tools
- The GPT-4o model for best performance

```typescript
const hotelConciergeAgent = new Agent({
  name: 'Hotel Concierge Assistant',
  model: 'gpt-4o',
  instructions: '...',
  tools: [roomServiceTool, housekeepingTool, towelTool, spaTool],
});
```

### 3. Running the Agent

The agent processes messages using the `run` function:
```typescript
const result = await run(hotelConciergeAgent, userMessage);
console.log(result.finalOutput); // Agent's response
console.log(result.toolCalls);   // Tools that were used
```

## 🔌 REST API

### POST `/api/chat`

Send a message to the agent.

**Request**:
```json
{
  "message": "I want to order room service",
  "sessionId": "optional-session-id"
}
```

**Response**:
```json
{
  "response": "I'd be happy to help you with room service! ...",
  "toolCalls": [...],
  "sessionId": "session-123"
}
```

### GET `/api/health`

Check if the server is running.

### DELETE `/api/session/:sessionId`

Clear a conversation session.

## 🎨 Customization

### Adding New Services

To add a new hotel service:

1. **Create a new tool file** in `src/tools/`:
```typescript
// src/tools/valet.ts
import { z } from 'zod';
import { tool } from '@openai/agents';

const valetSchema = z.object({
  roomNumber: z.string(),
  service: z.enum(['parking', 'retrieval']),
  carDetails: z.string(),
});

async function requestValet(params: z.infer<typeof valetSchema>) {
  // Implementation
}

export const valetTool = tool({
  name: 'request_valet',
  description: 'Request valet parking service',
  parameters: valetSchema,
  execute: requestValet,
});
```

2. **Add the tool to the agent** in `src/agent.ts`:
```typescript
import { valetTool } from './tools/valet.js';

const hotelConciergeAgent = new Agent({
  // ...
  tools: [...existingTools, valetTool],
});
```

### Modifying Agent Behavior

Edit the `instructions` field in `src/agent.ts` to change how the agent responds and behaves.

### Response Formatting Guidelines

The agent follows specific formatting rules when presenting information from JSON-based tools (menus, events, facility hours). These guidelines ensure responses are clear, scannable, and conversational rather than dense text blocks.

See `src/RESPONSE_FORMATTING_GUIDE.md` for detailed examples of:
- ✅ Good response formatting (with proper spacing, bullet points, and structure)
- ⛔ Bad response formatting (dense text blocks to avoid)
- Best practices for presenting lists and menus

The agent is configured to automatically follow these guidelines when using tools that return structured data.

## 🔐 Security Best Practices

This implementation follows security-first development:

- ✅ **No hardcoded secrets**: API keys loaded from environment variables
- ✅ **Input validation**: All tool parameters validated with Zod schemas
- ✅ **Parameterized queries**: Safe data handling patterns
- ✅ **CORS enabled**: Configurable for production use

### Production Considerations

For production deployment:

1. **API Key Management**: Use a secrets manager (AWS Secrets Manager, HashiCorp Vault)
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Authentication**: Implement guest authentication/authorization
4. **Database**: Replace in-memory sessions with a proper database
5. **Logging**: Add proper logging and monitoring
6. **Error Handling**: Enhance error handling and user feedback

## 📚 Learn More

- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-js)
- [OpenAI Platform](https://platform.openai.com/)
- [Zod Documentation](https://zod.dev/)

## 🐛 Troubleshooting

### "Cannot find package '@openai/agents'"
Make sure you've run `npm install` and that the package is installed correctly.

### "Error: Invalid API Key"
Check that your `OPENAI_API_KEY` environment variable is set correctly.

### "Module not found" errors
Ensure you're using Node.js 18+ and that all dependencies are installed.

### Server won't start
Check that port 3000 is not already in use, or set a different port:
```bash
PORT=3001 npm run web
```

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
