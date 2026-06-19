require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// ── In-memory store ──────────────────────────────────────────────────────────
const users = new Map();
let uid = 1;

function getUser(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  const id = parseInt(token.replace('tok_', ''));
  const user = [...users.values()].find(u => u.id === id);
  if (!user) { res.status(404).json({ error: 'Not found' }); return null; }
  return user;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, username } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if ([...users.values()].find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const uname = username || name.toLowerCase().replace(/\s+/g, '_') + uid;
  if ([...users.values()].find(u => u.username === uname)) return res.status(409).json({ error: 'Username taken' });
  const user = {
    id: uid++, name, email, password, username: uname, bio: '', avatarInitial: name[0].toUpperCase(),
    shelf: [], lists: [], tasteProfile: {}, feedbackMap: {}, stamps: [], stampCount: 0,
    createdAt: new Date().toISOString()
  };
  users.set(email, user);
  const { password: _, ...safe } = user;
  res.json({ user: safe, token: `tok_${user.id}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...safe } = user;
  res.json({ user: safe, token: `tok_${user.id}` });
});

// ── User profile ──────────────────────────────────────────────────────────────
app.put('/api/user/profile', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  const { name, bio, username } = req.body;
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (username) {
    const conflict = [...users.values()].find(u => u.username === username && u.id !== user.id);
    if (conflict) return res.status(409).json({ error: 'Username already taken' });
    user.username = username;
  }
  const { password: _, ...safe } = user;
  res.json(safe);
});

// Search users by username
app.get('/api/users/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json([]);
  const results = [...users.values()]
    .filter(u => u.username?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q))
    .slice(0, 10)
    .map(({ password: _, ...safe }) => safe);
  res.json(results);
});

// Get public profile by username
app.get('/api/users/:username', (req, res) => {
  const user = [...users.values()].find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safe } = user;
  res.json(safe);
});

// ── Stamps (likes on profiles) ────────────────────────────────────────────────
app.post('/api/users/:username/stamp', (req, res) => {
  const me = getUser(req, res); if (!me) return;
  const target = [...users.values()].find(u => u.username === req.params.username);
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.id === me.id) return res.status(400).json({ error: 'Cannot stamp yourself' });
  if (!target.stamps) target.stamps = [];
  const already = target.stamps.find(s => s.fromId === me.id);
  if (already) {
    target.stamps = target.stamps.filter(s => s.fromId !== me.id);
  } else {
    target.stamps.push({ fromId: me.id, fromName: me.name, fromUsername: me.username, at: new Date().toISOString() });
  }
  target.stampCount = target.stamps.length;
  const { password: _, ...safe } = target;
  res.json({ stampCount: target.stampCount, stamped: !already, profile: safe });
});

// ── Shelf ────────────────────────────────────────────────────────────────────
app.get('/api/user/shelf', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  res.json(user.shelf || []);
});
app.post('/api/user/shelf', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  const item = req.body;
  if (!user.shelf.find(s => s.id === item.id)) user.shelf.push({ ...item, savedAt: new Date().toISOString() });
  res.json(user.shelf);
});
app.delete('/api/user/shelf/:itemId', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  user.shelf = user.shelf.filter(s => s.id !== req.params.itemId);
  res.json(user.shelf);
});

// ── Custom Lists ──────────────────────────────────────────────────────────────
app.get('/api/user/lists', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  res.json(user.lists || []);
});
app.post('/api/user/lists', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  const { name, type } = req.body; // type: book|film|game|all
  const list = { id: `list_${Date.now()}`, name: name || 'My List', type: type || 'all', items: [], createdAt: new Date().toISOString() };
  user.lists.push(list);
  res.json(user.lists);
});
app.put('/api/user/lists/:listId', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  const list = user.lists.find(l => l.id === req.params.listId);
  if (!list) return res.status(404).json({ error: 'List not found' });
  if (req.body.name !== undefined) list.name = req.body.name;
  if (req.body.type !== undefined) list.type = req.body.type;
  res.json(user.lists);
});
app.delete('/api/user/lists/:listId', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  user.lists = user.lists.filter(l => l.id !== req.params.listId);
  res.json(user.lists);
});
app.post('/api/user/lists/:listId/items', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  const list = user.lists.find(l => l.id === req.params.listId);
  if (!list) return res.status(404).json({ error: 'List not found' });
  const item = req.body;
  if (!list.items.find(i => i.id === item.id)) list.items.push(item);
  res.json(user.lists);
});
app.delete('/api/user/lists/:listId/items/:itemId', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  const list = user.lists.find(l => l.id === req.params.listId);
  if (!list) return res.status(404).json({ error: 'List not found' });
  list.items = list.items.filter(i => i.id !== req.params.itemId);
  res.json(user.lists);
});

// ── Feedback / Taste ──────────────────────────────────────────────────────────
app.post('/api/user/feedback', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  const { itemId, direction, tags } = req.body;
  user.feedbackMap[itemId] = direction;
  const delta = direction === 'up' ? 0.15 : -0.12;
  tags.forEach(t => { user.tasteProfile[t] = Math.max(-1, Math.min(1, (user.tasteProfile[t] || 0) + delta)); });
  res.json({ tasteProfile: user.tasteProfile, feedbackMap: user.feedbackMap });
});
app.get('/api/user/taste', (req, res) => {
  const user = getUser(req, res); if (!user) return;
  res.json({ tasteProfile: user.tasteProfile, feedbackMap: user.feedbackMap });
});

// ── LLM via Groq (Llama 3) ───────────────────────────────────────────────────
async function callGroq(prompt, maxTokens = 600) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.3,
  });
  return completion.choices[0].message.content || '';
}

function safeParseJSON(raw) {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const start = cleaned.search(/[\[{]/);
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (start === -1 || end === -1) throw new Error('No JSON found');
  return JSON.parse(cleaned.slice(start, end + 1));
}

app.post('/api/llm/detect-tags', async (req, res) => {
  const { text, tags } = req.body;
  try {
    const raw = await callGroq(
      `You are a vibe-matching assistant for a media recommendation app.\n\nUser description: "${text}"\nAvailable tags: ${tags.join(', ')}\n\nReturn ONLY valid JSON with no extra text:\n{"tags": ["Tag1","Tag2"], "reasoning": "one sentence"}\n\nRules: Handle typos and franchise references gracefully. Pick 2-6 tags from the list only.`,
      400
    );
    res.json(safeParseJSON(raw));
  } catch (e) {
    res.status(500).json({ error: e.message, tags: [] });
  }
});

app.post('/api/llm/ai-picks', async (req, res) => {
  const { tags, mode, count = 8 } = req.body;
  const modeStr = mode === 'all' ? 'books, films, and games (good mix of all three)' :
    mode === 'books' ? 'books only' : mode === 'films' ? 'films/movies only' : 'video games only';
  try {
    const raw = await callGroq(
      `You are a media recommendation AI. Vibe tags: ${tags.join(', ')}.\n\nGenerate exactly ${count} recommendations (${modeStr}). Include classics and hidden gems.\n\nReturn ONLY a valid JSON array with no extra text:\n[{"title":"","type":"book|film|game","meta":"Author/Director · Year","genre":"Genre","blurb":"One compelling sentence.","why":"Why it matches the vibe."}]\n\nNo markdown, no explanation, just the JSON array.`,
      1200
    );
    res.json(safeParseJSON(raw));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Vibeshelf API on :${PORT}`));
