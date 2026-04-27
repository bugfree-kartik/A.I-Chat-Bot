import { ChatMemory } from './chat-memory';

export { ChatMemory };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve static files from public directory
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return env.ASSETS.fetch(request);
    }
    
    // Handle API routes
    if (url.pathname === '/api/chat') {
      return handleChatRequest(request, env);
    }
    
    // Handle history endpoint
    if (url.pathname === '/api/history') {
      return handleHistoryRequest(request, env);
    }
    
    // Handle clear history endpoint
    if (url.pathname === '/api/clear') {
      return handleClearRequest(request, env);
    }
    
    // Handle session summary endpoint
    if (url.pathname === '/api/summary') {
      return handleSummaryRequest(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  },
};

async function handleChatRequest(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message } = await request.json();
    
    // Validate input
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message must be a string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Message too long (max 4000 characters)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get or create chat memory Durable Object
    const memoryId = env.CHAT_MEMORY.idFromName('default-chat');
    const memoryStub = env.CHAT_MEMORY.get(memoryId);
    
    // Get chat history from memory
    const history = await memoryStub.getHistory();
    
    // Prepare messages for Llama 3
    const messages = [
      { role: 'system', content: 'You are a helpful AI assistant. Be concise and friendly.' },
      ...history,
      { role: 'user', content: message.trim() }
    ];

    // Call Cloudflare Workers AI with Llama 3
    const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    if (!aiResponse || !aiResponse.response) {
      throw new Error('Invalid AI response');
    }

    const response = aiResponse.response.trim();
    
    if (!response) {
      throw new Error('Empty AI response');
    }
    
    // Store conversation in memory
    await memoryStub.addMessage(message.trim(), response);

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (error.message.includes('AI binding')) {
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleHistoryRequest(request, env) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const memoryId = env.CHAT_MEMORY.idFromName('default-chat');
    const memoryStub = env.CHAT_MEMORY.get(memoryId);
    const history = await memoryStub.getHistory();

    return new Response(JSON.stringify({ history }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('History error:', error);
    
    if (error.message.includes('Durable Object')) {
      return new Response(JSON.stringify({ error: 'Memory service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to retrieve history' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleClearRequest(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const memoryId = env.CHAT_MEMORY.idFromName('default-chat');
    const memoryStub = env.CHAT_MEMORY.get(memoryId);
    await memoryStub.clearHistory();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Clear error:', error);
    
    if (error.message.includes('Durable Object')) {
      return new Response(JSON.stringify({ error: 'Memory service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to clear history' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleSummaryRequest(request, env) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const memoryId = env.CHAT_MEMORY.idFromName('default-chat');
    const memoryStub = env.CHAT_MEMORY.get(memoryId);
    const summary = await memoryStub.getConversationSummary();

    return new Response(JSON.stringify({ summary }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Summary error:', error);
    
    if (error.message.includes('Durable Object')) {
      return new Response(JSON.stringify({ error: 'Memory service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to retrieve summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
