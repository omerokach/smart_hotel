// Main entry point - demonstrates basic usage
import 'dotenv/config';
import { run } from '@openai/agents';
import { hotelConciergeAgent } from './agent.js';

async function main() {
  console.log('🏨 Smart Hotel AI Agent Demo\n');
  
  // Example interaction
  const result = await run(
    hotelConciergeAgent,
    'Hi, I would like to order room service. I am in room 305 and I want a cheeseburger, fries, and a coca cola.'
  );
  
  console.log('\n📝 Agent Response:');
  console.log(result.finalOutput);
  
  // `@openai/agents` RunResult doesn't expose `toolCalls`, so we extract tool items from newItems
  const toolItems = result.newItems?.filter(
    (item: any) => item.type === 'tool_call_item' || item.type === 'tool_call_output_item',
  ) ?? [];

  if (toolItems.length > 0) {
    console.log('\n\n🔧 Tools Used:');
    toolItems.forEach((item: any, idx: number) => {
      const name = item.rawItem?.name || item.rawItem?.toolName || 'unknown_tool';
      console.log(`  ${idx + 1}. ${name} (${item.type})`);
    });
  } else {
    console.log('\n\n🔧 Tools Used: none');
  }
}

// Run only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { hotelConciergeAgent };
