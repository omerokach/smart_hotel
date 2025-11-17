# Tool Configuration Architecture

## Overview
Each tool now contains its own behavioral instructions, making the codebase more modular and maintainable. Tool-specific instructions are defined in their respective files and imported into the main agent.

## Structure

### Tool Files (src/tools/)
Each tool file exports:
1. **Schema** - Zod schema for parameter validation
2. **Execute function** - Implementation of the tool logic
3. **Instructions** (NEW) - Tool-specific behavioral guidelines
4. **Data loaders** - Functions to load JSON data if applicable

### Main Agent (src/agent.ts)
The agent imports and composes all tool instructions into the main system prompt.

## Tool Instruction Exports

### Room Service (`roomService.ts`)
- Export: `roomServiceInstructions`
- Controls: Menu presentation, order handling, confirmation response
- Post-confirmation: "Perfect! Your order will arrive in 20-30 minutes. Enjoy!"

### Spa Service (`spa.ts`)
- Export: `spaInstructions`
- Controls: Spa menu presentation, booking handling, confirmation response
- Post-confirmation: "All set! Your spa appointment is confirmed for [time]. Enjoy!"

### Events (`events.ts`)
- Export: `eventsInstructions`
- Controls: Event formatting, front desk direction, response format
- Post-confirmation: Direct guests to front desk for registration

### Housekeeping (`housekeeping.ts`)
- Export: `housekeepingInstructions`
- Controls: Service type selection, confirmation response
- Post-confirmation: "Perfect! Housekeeping will be there shortly. Enjoy your stay!"

### Extra Equipment (`extraEquipment.ts`)
- Export: `extraEquipmentInstructions`
- Controls: Equipment requests, quantity handling, confirmation response
- Post-confirmation: "No problem! Your [items] are on the way. Enjoy your stay!"

## Benefits of This Architecture

### 1. Modularity
- Each tool is self-contained with its own behavior rules
- Easy to update a single tool without affecting others

### 2. Maintainability
- Tool-specific instructions live with the tool code
- Clear separation of concerns

### 3. Scalability
- Adding new tools is straightforward: create file → export instructions → import to agent
- No need to modify large instruction blocks in agent.ts

### 4. Discoverability
- Developers can understand tool behavior by looking at the tool file
- No need to search through large agent instruction blocks

## How to Add a New Tool

1. **Create tool file** in `src/tools/yourTool.ts`
```typescript
// Export instructions
export const yourToolInstructions = `
YOUR TOOL BEHAVIOR:
- Specific behavior rules
- Confirmation format
- Response format
`;

// Export schema
export const yourToolSchema = z.object({
  // parameters
});

// Export execute function
export async function executeYourTool(params) {
  // implementation
}
```

2. **Import in agent.ts**
```typescript
import { executeYourTool, yourToolSchema, yourToolInstructions } from './tools/yourTool.js';
```

3. **Create tool definition**
```typescript
const yourTool = tool({
  name: 'your_tool',
  description: 'Description for AI',
  parameters: yourToolSchema as any,
  execute: executeYourTool,
});
```

4. **Add to agent tools array and instructions**
```typescript
// In agent instructions
${yourToolInstructions}

// In tools array
tools: [...existingTools, yourTool]
```

## Files Modified in This Refactor

- ✅ `src/tools/roomService.ts` - Added roomServiceInstructions
- ✅ `src/tools/spa.ts` - Added spaInstructions
- ✅ `src/tools/events.ts` - Added eventsInstructions
- ✅ `src/tools/housekeeping.ts` - Added housekeepingInstructions
- ✅ `src/tools/extraEquipment.ts` - Added extraEquipmentInstructions
- ✅ `src/agent.ts` - Now imports and uses tool instructions

## Testing
Server confirmed running at http://localhost:3000 with new architecture.
All linting checks passed.

