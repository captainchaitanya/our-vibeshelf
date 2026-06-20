// In dev, Vite proxies /api → localhost:3001. In production, set VITE_API_URL on Netlify.
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
