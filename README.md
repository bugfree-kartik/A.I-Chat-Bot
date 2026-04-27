# AI Chatbot on Cloudflare

A simple AI-powered chatbot built by Azeez Moiz Dandawala on Cloudflare's platform using Workers AI, Durable Objects, and Pages.

**🚀 Live Demo**: https://azeez-ai-chatbot.azeezmoiz-dandawala.workers.dev

## Features

- **LLM Integration**: Uses Llama 3 via Cloudflare Workers AI
- **Memory Management**: Persistent conversation history using Durable Objects
- **Real-time Chat**: Interactive web interface with live updates
- **Session Tracking**: Displays message count and session duration
- **Error Handling**: Comprehensive validation and error responses
- **Responsive Design**: Clean, modern UI that works on all devices

## Architecture

### Components

1. **Cloudflare Worker** (`src/index.js`)
   - Main application logic
   - API endpoints for chat, history, and session management
   - Integration with Workers AI and Durable Objects

2. **Durable Object** (`src/chat-memory.js`)
   - Manages conversation history
   - Session metadata tracking
   - Memory cleanup and optimization

3. **Web Interface** (`public/index.html`)
   - Chat UI with real-time updates
   - Session information display
   - Error handling and user feedback

### API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/history` - Retrieve conversation history
- `POST /api/clear` - Clear conversation history
- `GET /api/summary` - Get session summary and statistics

## Setup and Deployment

### Prerequisites

- Node.js and npm
- Cloudflare account
- Wrangler CLI installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/azeez-72/cf_ai_project.git
cd cf_ai_project
```

2. Install dependencies:
```bash
npm install
```

3. Authenticate with Cloudflare:
```bash
npx wrangler login
```

4. Configure your environment:
   - Update `wrangler.toml` with your account details
   - Ensure Workers AI is enabled for your account

### Local Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8787`

### Deployment

Deploy to Cloudflare:
```bash
npm run deploy
```

## Usage

1. Open the deployed URL in your browser
2. Type your message in the input field
3. Press Enter or click "Send" to chat with the AI
4. Use the "Clear" button to reset the conversation
5. View session information in the header

## Configuration

### AI Model Settings

The chatbot uses Llama 3 with the following settings:
- Max tokens: 500
- Temperature: 0.7
- System prompt: "You are a helpful AI assistant. Be concise and friendly."

### Memory Management

- Stores last 20 messages in conversation history
- Automatic cleanup of old messages
- Session metadata includes creation time, message count, and duration

## Error Handling

The application includes comprehensive error handling for:
- Invalid input validation
- AI service unavailability
- Memory service errors
- Network issues
- JSON parsing errors

## Development Notes

### File Structure

```
cf_ai_project/
├── src/
│   ├── index.js          # Main Worker logic
│   └── chat-memory.js    # Durable Object for memory
├── public/
│   └── index.html        # Web interface
├── package.json          # Dependencies and scripts
├── wrangler.toml         # Cloudflare configuration
└── README.md            # This file
```

### Key Technologies

- **Cloudflare Workers**: Serverless compute platform
- **Workers AI**: Llama 3 model hosting
- **Durable Objects**: Persistent storage and state management
- **HTML/CSS/JavaScript**: Frontend interface

### Security Considerations

- Input validation and sanitization
- Rate limiting considerations
- Error message sanitization
- Secure API design

## Troubleshooting

### Common Issues

1. **AI Service Unavailable**: Ensure Workers AI is enabled in your Cloudflare account
2. **Memory Errors**: Check Durable Objects configuration in wrangler.toml
3. **Deployment Issues**: Verify Wrangler authentication and permissions

### Debugging

- Check browser console for frontend errors
- Use `wrangler tail` to view Worker logs
- Monitor Durable Objects storage usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Author

**Built by**: Azeez Moiz Dandawala  
**Email**: azeezmoiz.dandawala@stonybrook.edu  
**GitHub**: https://github.com/azeez-72

## License

This project is open source and available under MIT License.
