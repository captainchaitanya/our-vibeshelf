import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const anonId = sessionStorage.getItem('vs_anon_id') || crypto.randomUUID();
sessionStorage.setItem('vs_anon_id', anonId);
window.pendo.initialize({ visitor: { id: anonId } });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
