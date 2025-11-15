// Interactive CLI chat interface
import 'dotenv/config';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { run } from '@openai/agents';
import { hotelConciergeAgent } from './agent.js';

const rl = readline.createInterface({ input, output });

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         🏨 Smart Hotel AI Concierge - Chat Interface        ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
console.log('Welcome! I can help you with:');
console.log('  • Room Service 🍽️');
console.log('  • Housekeeping 🧹');
console.log('  • Extra Towels 🛁');
console.log('  • Spa Appointments 💆');
console.log('');
console.log('Type "exit" or "quit" to end the conversation.');
console.log('───────────────────────────────────────────────────────────────');
console.log('');

async function chat() {
  while (true) {
    const userMessage = await rl.question('You: ');
    
    if (!userMessage.trim()) {
      continue;
    }
    
    if (userMessage.toLowerCase() === 'exit' || userMessage.toLowerCase() === 'quit') {
      console.log('\n🏨 Thank you for staying with us! Have a wonderful day!\n');
      rl.close();
      process.exit(0);
    }
    
    try {
      console.log('\n🤔 Processing your request...\n');
      
      const result = await run(hotelConciergeAgent, userMessage);
      
      console.log('Assistant:', result.finalOutput);
      console.log('');
      
      // Show which tools were used (for debugging/transparency)
      if (result.toolCalls && result.toolCalls.length > 0) {
        console.log('───────────────────────────────────────────────────────────────');
        console.log('🔧 Actions taken:');
        result.toolCalls.forEach((toolCall, index) => {
          console.log(`  ${index + 1}. ${toolCall.name}`);
        });
        console.log('───────────────────────────────────────────────────────────────');
        console.log('');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('\n❌ Error:', error.message);
      } else {
        console.error('\n❌ An unexpected error occurred');
      }
      console.log('');
    }
  }
}

chat().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

