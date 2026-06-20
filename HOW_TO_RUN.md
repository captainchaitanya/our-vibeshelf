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

## Deploy to production

### Frontend (Netlify)
1. Push this repo to GitHub (no secrets — `.env` is gitignored).
2. Connect the repo on [Netlify](https://app.netlify.com).
3. Netlify reads `netlify.toml` automatically (builds from `client/`).
4. Add environment variable: `VITE_API_URL` = `https://YOUR-BACKEND-URL/api`

### Backend (Render, Railway, or similar)
The Express API must run on a separate host (Netlify serves only the static React app).

1. Create a **Web Service** pointing at the `server/` folder.
2. Build command: `npm install`
3. Start command: `node index.js`
4. Add environment variable: `GROQ_API_KEY` = your key from https://console.groq.com
5. Copy the service URL and set it as `VITE_API_URL` on Netlify (with `/api` suffix).

The Groq key lives **only** on the backend host — never in GitHub or the browser.

## What's new in this version
- 🦙 Llama 3.3-70B via Groq (free) replaces Anthropic API
- 📊 547 titles from your Excel file integrated
- 🔍 Search other users by username
- ⭐ Stamp other users' profiles to show appreciation
- 📚 Shelf categorized by Books / Films / Games
- 📋 Custom lists (rename, delete, add items from search)
- 🎯 Taste profile radar chart
- 👤 Attractive About Me section on profiles
