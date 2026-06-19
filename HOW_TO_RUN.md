# Vibeshelf — How to Run

## 1. Get your FREE Groq API key
- Go to https://console.groq.com
- Sign up (no credit card needed)
- Go to API Keys → Create Key
- Copy the key (starts with gsk_...)

## 2. Add the key to the server
- Copy `server/.env.example` to `server/.env`
- Paste your key: GROQ_API_KEY=gsk_your_key_here

## 3. Start the server (Terminal 1)
```bash
cd vibeshelf/server
npm install
node index.js
```
You should see: Vibeshelf API on :3001

## 4. Start the frontend (Terminal 2)
```bash
cd vibeshelf/client
npm install
npm run dev
```
Open: http://localhost:5173

## What's new in this version
- 🦙 Llama 3.3-70B via Groq (free) replaces Anthropic API
- 📊 547 titles from your Excel file integrated
- 🔍 Search other users by username
- ⭐ Stamp other users' profiles to show appreciation
- 📚 Shelf categorized by Books / Films / Games
- 📋 Custom lists (rename, delete, add items from search)
- 🎯 Taste profile radar chart
- 👤 Attractive About Me section on profiles
