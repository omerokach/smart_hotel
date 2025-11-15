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
  
  console.log('\n\n🔧 Tools Used:');
  console.log(JSON.stringify(result.toolCalls, null, 2));
}

// Run only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { hotelConciergeAgent };

