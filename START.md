# Vibeshelf — MERN Stack App

## Quick Start

### 1. Start the API server
```bash
cd server
node index.js
# Server runs on http://localhost:3001
```

### 2. Start the React frontend (development)
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### OR serve the production build
```bash
cd client
npx serve dist -p 5173
```

## Stack
- **Frontend**: React + Vite + Recharts + Framer Motion
- **Backend**: Express.js (in-memory store; swap for MongoDB with Mongoose)
- **AI**: Anthropic Claude API (claude-sonnet-4-6) for tag detection + pick generation

## Adding MongoDB
Replace the in-memory Maps in `server/index.js` with Mongoose models.
Set `MONGODB_URI` in a `.env` file and connect at startup.

## Environment
The Anthropic API key is passed through the browser (same as original).
For production, proxy all `/api/llm/*` calls through the server with your key in `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```
