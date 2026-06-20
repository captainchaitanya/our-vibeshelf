import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const TYPE_COLOR = { book:'var(--book)', film:'var(--film)', game:'var(--game)' };
const TYPE_LABEL = { book:'📚 Book', film:'🎬 Film', game:'🎮 Game' };

export default function PublicProfilePage({ username, onBack }) {
  const { user, api } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stamped, setStamped] = useState(false);
  const [stampCount, setStampCount] = useState(0);
  const [stamping, setStamping] = useState(false);
  const [shelfTab, setShelfTab] = useState('books');

  useEffect(() => {
    fetch(`${API_BASE}/users/${username}`)
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setStampCount(data.stampCount || 0);
        if (user && data.stamps) setStamped(data.stamps.some(s => s.fromId === user.id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username, user]);

  const handleStamp = async () => {
    if (!user) { alert('Log in to stamp profiles!'); return; }
    setStamping(true);
    try {
      const r = await api('post', `/users/${username}/stamp`);
      setStamped(r.data.stamped);
      setStampCount(r.data.stampCount);
    } catch (e) { console.error(e); }
    finally { setStamping(false); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text2)' }}>Loading profile…</div>;
  if (!profile || profile.error) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <p style={{ color:'var(--text2)', marginBottom:20 }}>User not found.</p>
      <button className="btn btn-ghost btn-sm" onClick={onBack}>← Go back</button>
    </div>
  );

  const shelfByType = (type) => (profile.shelf||[]).filter(s => s.type === type);

  return (
    <div style={{ minHeight:'100vh', padding:'36px 0 80px' }}>
      <div className="wrap">
        <div style={{ marginBottom:24 }}>
          <button onClick={onBack} style={{ fontFamily:'var(--font-ui)', fontSize:'0.82rem', color:'var(--accent)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>← Back</button>
        </div>

        {/* Profile card */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:28, padding:'clamp(24px,4vw,44px)', marginBottom:28, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>

          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:28, alignItems:'start' }}>
            {/* Avatar */}
            <div style={{ width:100, height:100, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--book2))', color:'#1a1000', fontFamily:'var(--font-display)', fontSize:'2.4rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid var(--accent)', flexShrink:0 }}>
              {profile.name?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div>
              <h1 className="display" style={{ fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:700, marginBottom:4 }}>{profile.name}</h1>
              <p style={{ fontSize:'0.84rem', color:'var(--text3)', fontFamily:'var(--font-ui)', marginBottom:12 }}>@{profile.username}</p>

              {/* Attractive bio */}
              {profile.bio && (
                <div style={{ background:'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(58,191,163,0.06))', border:'1px solid rgba(201,168,76,0.18)', borderRadius:16, padding:'14px 18px', marginBottom:18, maxWidth:500, position:'relative' }}>
                  <div style={{ position:'absolute', top:-10, left:16, background:'var(--surface)', padding:'2px 10px', borderRadius:999, fontSize:'0.68rem', fontWeight:700, fontFamily:'var(--font-ui)', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', border:'1px solid rgba(201,168,76,0.25)' }}>About</div>
                  <p style={{ fontSize:'0.92rem', color:'var(--text)', lineHeight:1.7, fontStyle:'italic', marginTop:4 }}>"{profile.bio}"</p>
                </div>
              )}

              <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
                {[
                  { num: shelfByType('book').length, lbl:'📚 Books', color:'var(--book)' },
                  { num: shelfByType('film').length, lbl:'🎬 Films', color:'var(--film)' },
                  { num: shelfByType('game').length, lbl:'🎮 Games', color:'var(--game)' },
                  { num: stampCount, lbl:'⭐ Stamps', color:'#f0c040' },
                ].map(s=>(
                  <div key={s.lbl}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700, color:s.color }}>{s.num}</div>
                    <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.7rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stamp button */}
            {user && user.username !== profile.username && (
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <button onClick={handleStamp} disabled={stamping}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 22px', borderRadius:20, border:`2px solid ${stamped?'#f0c040':'var(--border)'}`, background: stamped?'rgba(240,192,64,0.12)':'var(--surface2)', cursor:'pointer', transition:'all 0.22s', minWidth:90 }}
                  onMouseEnter={e=>{ if(!stamped){ e.currentTarget.style.borderColor='#f0c040'; e.currentTarget.style.background='rgba(240,192,64,0.08)'; }}}
                  onMouseLeave={e=>{ if(!stamped){ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface2)'; }}}>
                  <span style={{ fontSize:'2rem', filter: stamped?'none':'grayscale(1)', transition:'filter 0.2s, transform 0.2s', transform: stamped?'scale(1.1)':'scale(1)' }}>⭐</span>
                  <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.8rem', fontWeight:700, color: stamped?'#f0c040':'var(--text2)' }}>{stamped?'Stamped!':'Stamp'}</span>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:'#f0c040', lineHeight:1 }}>{stampCount}</span>
                  <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.68rem', color:'var(--text3)' }}>stamps</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shelf tabs */}
        <h2 className="display" style={{ fontSize:'1.4rem', fontWeight:600, marginBottom:16 }}>Their Shelf</h2>
        <div style={{ display:'flex', gap:0, background:'var(--surface)', borderRadius:12, padding:4, width:'fit-content', marginBottom:22 }}>
          {['books','films','games'].map(t=>(
            <button key={t} onClick={()=>setShelfTab(t)}
              style={{ padding:'8px 20px', borderRadius:10, fontFamily:'var(--font-ui)', fontSize:'0.84rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s', background: shelfTab===t?(t==='books'?'var(--book)':t==='films'?'var(--film)':'var(--game)'):'none', color: shelfTab===t?(t==='books'||t==='films'?'#fff':'#001a14'):'var(--text3)' }}>
              {t==='books'?'📚 Books':t==='films'?'🎬 Films':'🎮 Games'} ({shelfByType(t==='books'?'book':t==='films'?'film':'game').length})
            </button>
          ))}
        </div>

        {(() => {
          const items = shelfByType(shelfTab==='books'?'book':shelfTab==='films'?'film':'game');
          if (items.length===0) return <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>Nothing saved here yet.</div>;
          return (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px,1fr))', gap:16 }}>
              {items.map(item=>(
                <div key={item.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderTop:`3px solid ${TYPE_COLOR[item.type]||'var(--accent)'}`, borderRadius:16, padding:18, display:'flex', flexDirection:'column', gap:8, transition:'transform 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                  <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.66rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text3)' }}>{TYPE_LABEL[item.type]||item.type}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, lineHeight:1.25 }}>{item.title}</div>
                  <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.76rem', color:'var(--text3)' }}>{item.meta}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
