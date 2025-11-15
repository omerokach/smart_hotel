// Web server with REST API for the chat interface
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { run } from '@openai/agents';
import { hotelConciergeAgent } from './agent.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store conversation history per session (in production, use a proper database)
const sessions = new Map<string, { messages: Array<{ role: string; content: string }> }>();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { messages: [] });
    }
    
    const session = sessions.get(sessionId)!;
    
    // Add user message to history
    session.messages.push({ role: 'user', content: message });
    
    // Run the agent
    const result = await run(hotelConciergeAgent, message);
    
    // Add assistant response to history
    session.messages.push({ role: 'assistant', content: result.finalOutput });
    
    // Return response
    res.json({
      response: result.finalOutput,
      toolCalls: result.toolCalls || [],
      sessionId,
    });
    
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agent: 'Smart Hotel AI Concierge' });
});

// Clear session endpoint
app.delete('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  res.json({ message: 'Session cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🏨 Smart Hotel AI Concierge - Web Server            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📱 Chat UI: http://localhost:${PORT}`);
  console.log(`🔌 API endpoint: http://localhost:${PORT}/api/chat`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

export default app;

