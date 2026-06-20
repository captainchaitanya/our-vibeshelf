import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ open, mode: init, onClose }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(init || 'login');
  const [name, setName] = useState(''); const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setMode(init || 'login'); }, [open, init]);

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        window.pendo?.track("user_logged_in", {
          login_method: "email"
        });
      } else {
        await signup(name, email, password, username);
        window.pendo?.track("user_signed_up", {
          username,
          has_display_name: !!name.trim()
        });
      }
      onClose();
    } catch (e) { setError(e.response?.data?.error || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer' }}>×</button>
        <h2 className="display" style={{ fontSize: '1.6rem', marginBottom: 6 }}>{mode === 'login' ? 'Welcome back' : 'Join Vibeshelf'}</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text2)', marginBottom: 24 }}>{mode === 'login' ? 'Log in to save discoveries & stamp profiles' : 'Free forever · Start discovering'}</p>
        <div style={{ display: 'flex', gap: 0, background: 'var(--bg2)', borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {['login','signup'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px 16px', borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: mode === m ? 'var(--surface2)' : 'none', color: mode === m ? 'var(--text)' : 'var(--text3)' }}>
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>
        {mode === 'signup' && <>
          <div className="field"><label>Display name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" onKeyDown={e => e.key==='Enter'&&handle()} /></div>
          <div className="field"><label>Username</label><input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} placeholder="e.g. bookworm_42" onKeyDown={e => e.key==='Enter'&&handle()} /></div>
        </>}
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key==='Enter'&&handle()} /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key==='Enter'&&handle()} /></div>
        {error && <p style={{ color: 'var(--film2)', fontSize: '0.84rem', marginBottom: 12, fontFamily: 'var(--font-ui)' }}>{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handle} disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </div>
    </div>
  );
}
