import { DurableObject } from "cloudflare:workers";

export class ChatMemory extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.env = env;
  }

  async addMessage(userMessage, botResponse) {
    const messages = await this.getHistory();
    const timestamp = new Date().toISOString();
    
    messages.push({ 
      role: 'user', 
      content: userMessage,
      timestamp 
    });
    messages.push({ 
      role: 'assistant', 
      content: botResponse,
      timestamp 
    });
    
    // Keep only last 20 messages to manage memory (increased from 10)
    if (messages.length > 20) {
      messages.splice(0, messages.length - 20);
    }
    
    await this.state.storage.put('messages', messages);
    
    // Update session metadata
    await this.updateSessionMetadata();
  }

  async getHistory() {
    return await this.state.storage.get('messages') || [];
  }

  async clearHistory() {
    await this.state.storage.delete('messages');
    await this.state.storage.delete('session_metadata');
  }

  async updateSessionMetadata() {
    const metadata = await this.state.storage.get('session_metadata') || {
      created_at: new Date().toISOString(),
      message_count: 0,
      last_activity: new Date().toISOString()
    };
    
    metadata.message_count += 2; // user + assistant
    metadata.last_activity = new Date().toISOString();
    
    await this.state.storage.put('session_metadata', metadata);
  }

  async getSessionMetadata() {
    return await this.state.storage.get('session_metadata') || {
      created_at: new Date().toISOString(),
      message_count: 0,
      last_activity: new Date().toISOString()
    };
  }

  async getConversationSummary() {
    const messages = await this.getHistory();
    const metadata = await this.getSessionMetadata();
    
    return {
      message_count: metadata.message_count,
      last_activity: metadata.last_activity,
      session_duration: this.calculateSessionDuration(metadata.created_at),
      recent_messages: messages.slice(-4) // Last 4 messages
    };
  }

  calculateSessionDuration(createdAt) {
    const start = new Date(createdAt);
    const now = new Date();
    const duration = now - start;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
