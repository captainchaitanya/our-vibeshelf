import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onNav, onLoginClick, currentPage }) {
  const { user, logout } = useAuth();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const searchTrackTimer = useRef(null);

  const search = async (val) => {
    setQ(val);
    if (!val.trim()) { setResults([]); return; }
    try {
      const r = await fetch(`http://localhost:3001/api/users/search?q=${encodeURIComponent(val)}`);
      const data = await r.json();
      setResults(data);
      if (searchTrackTimer.current) clearTimeout(searchTrackTimer.current);
      searchTrackTimer.current = setTimeout(() => {
        window.pendo?.track("user_search_completed", {
          query: val.trim().substring(0, 50),
          query_length: val.trim().length,
          results_count: data.length
        });
      }, 800);
    } catch { setResults([]); }
  };

  return (
    <header className="site-header">
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 16 }}>
        <div className="logo" onClick={() => onNav('home')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onNav('home')}>
          <div className="logo-mark">📚</div>
          Vibeshelf
        </div>

        {/* User search */}
        <div style={{ position: 'relative', flex: '0 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '7px 14px', gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke="var(--text3)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={q} onChange={e => { setSearching(true); search(e.target.value); }}
              onBlur={() => setTimeout(() => setSearching(false), 200)}
              onFocus={() => q && setSearching(true)}
              placeholder="Search users…"
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.84rem', width: '100%', fontFamily: 'var(--font-body)' }} />
          </div>
          {searching && results.length > 0 && (
            <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, zIndex: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
              {results.map(u => (
                <div key={u.id} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  onMouseDown={() => { onNav('public-profile', u.username); setQ(''); setResults([]); setSearching(false); }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#1a1000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text3)', fontFamily: 'var(--font-ui)' }}>@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <span className="nav-link" onClick={() => onNav('home')} style={{ cursor: 'pointer' }}>Discover</span>
              <span className="nav-link" onClick={() => onNav('profile')} style={{ cursor: 'pointer' }}>My Profile</span>
              <span className="nav-link" onClick={logout} style={{ cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text3)' }}>Sign out</span>
              <div className="avatar-btn" onClick={() => onNav('profile')} title={user.name}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <span className="nav-link" onClick={() => onLoginClick('login')} style={{ cursor: 'pointer' }}>Log in</span>
              <button className="btn btn-primary btn-sm" onClick={() => onLoginClick('signup')}>Sign up free</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
