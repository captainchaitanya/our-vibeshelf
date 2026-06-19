import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const TYPE_LABEL = { book: '📚 Book', film: '🎬 Film', game: '🎮 Game' };
const TYPE_COLOR = { book: 'var(--book)', film: 'var(--film)', game: 'var(--game)' };
const TABS = ['books','films','games'];

export default function ProfilePage({ shelf, lists, tasteProfile, onRemove, onGoDiscover, onRenameList, onDeleteList, onRemoveFromList, onCreateList }) {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [shelfTab, setShelfTab] = useState('books');
  const [listTab, setListTab] = useState('books');
  const [activeSection, setActiveSection] = useState('shelf'); // shelf | lists | taste
  const [renamingListId, setRenamingListId] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (user) { setEditName(user.name||''); setEditBio(user.bio||''); setEditUsername(user.username||''); }
  }, [user]);

  const saveProfile = async () => {
    await updateProfile({ name: editName, bio: editBio, username: editUsername });
    setEditing(false);
  };
  const handleAvatar = e => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(f);
  };

  const shelfByType = (type) => shelf.filter(s => s.type === type);
  const listsByType = (type) => lists.filter(l => l.type === type || l.type === 'all');

  const statsSaved = { book: shelfByType('book').length, film: shelfByType('film').length, game: shelfByType('game').length };
  const totalStamps = user?.stampCount || 0;
  const tasteEntries = Object.entries(tasteProfile || {}).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]));
  const radarData = tasteEntries.slice(0,10).map(([tag, val]) => ({
    tag: tag.length > 14 ? tag.slice(0,13)+'…' : tag,
    value: Math.max(0, (val+1)/2*100)
  }));

  if (!user) return <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text2)', fontFamily:'var(--font-ui)' }}>Please log in to view your profile.</div>;

  return (
    <div style={{ minHeight:'100vh', padding:'40px 0 80px' }}>
      <div className="wrap">

        {/* ── PROFILE HERO ── */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:28, padding:'clamp(24px,4vw,44px)', marginBottom:28, position:'relative', overflow:'hidden' }}>
          {/* Background decoration */}
          <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-60, left:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(58,191,163,0.05) 0%, transparent 70%)', pointerEvents:'none' }}/>

          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:32, alignItems:'start', position:'relative' }}>
            {/* Avatar */}
            <div style={{ position:'relative' }}>
              <div onClick={() => fileRef.current?.click()} style={{ width:110, height:110, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--book2))', color:'#1a1000', fontFamily:'var(--font-display)', fontSize:'2.8rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid var(--accent)', cursor:'pointer', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s', boxShadow:'0 0 0 0 rgba(201,168,76,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.boxShadow='0 0 0 5px rgba(201,168,76,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 0 0 rgba(201,168,76,0.3)'; }}>
                {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : user.name?.[0]?.toUpperCase()}
              </div>
              <div onClick={() => fileRef.current?.click()} style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.18s', fontSize:'0.72rem', fontWeight:700, color:'#fff', textAlign:'center', cursor:'pointer', lineHeight:1.3 }}
                onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>📷<br/>Change</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatar}/>
            </div>

            {/* Info */}
            <div>
              {editing ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:480 }}>
                  <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Display name"
                    style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', color:'var(--text)', fontSize:'1rem', width:'100%', fontFamily:'var(--font-body)' }}/>
                  <input value={editUsername} onChange={e=>setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} placeholder="username"
                    style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', color:'var(--text)', fontSize:'1rem', width:'100%', fontFamily:'var(--font-body)' }}/>
                  <textarea value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Tell the world about your taste in stories…" rows={3}
                    style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', color:'var(--text)', fontSize:'0.9rem', width:'100%', resize:'vertical', fontFamily:'var(--font-body)' }}/>
                  <div style={{ display:'flex', gap:10 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveProfile}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', marginBottom:4 }}>
                    <h1 className="display" style={{ fontSize:'clamp(1.6rem,3vw,2.1rem)', fontWeight:700 }}>{user.name}</h1>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(true)}>✏️ Edit</button>
                  </div>
                  <p style={{ fontSize:'0.84rem', color:'var(--text3)', fontFamily:'var(--font-ui)', marginBottom:8 }}>@{user.username}</p>

                  {/* Attractive About Me */}
                  {user.bio ? (
                    <div style={{ background:'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(58,191,163,0.06))', border:'1px solid rgba(201,168,76,0.18)', borderRadius:16, padding:'14px 18px', marginBottom:20, maxWidth:500, position:'relative' }}>
                      <div style={{ position:'absolute', top:-10, left:16, background:'var(--surface)', padding:'2px 10px', borderRadius:999, fontSize:'0.68rem', fontWeight:700, fontFamily:'var(--font-ui)', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', border:'1px solid rgba(201,168,76,0.25)' }}>About Me</div>
                      <p style={{ fontSize:'0.92rem', color:'var(--text)', lineHeight:1.7, fontStyle:'italic', marginTop:4 }}>"{user.bio}"</p>
                    </div>
                  ) : (
                    <div onClick={()=>setEditing(true)} style={{ background:'rgba(201,168,76,0.06)', border:'1px dashed rgba(201,168,76,0.25)', borderRadius:16, padding:'14px 18px', marginBottom:20, maxWidth:500, cursor:'pointer', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(201,168,76,0.1)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(201,168,76,0.06)'}>
                      <p style={{ fontSize:'0.86rem', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>✨ Add a bio to tell others about your taste in stories…</p>
                    </div>
                  )}

                  {/* Stats row */}
                  <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
                    {[
                      { num: statsSaved.book, lbl: '📚 Books saved', color: 'var(--book)' },
                      { num: statsSaved.film, lbl: '🎬 Films saved', color: 'var(--film)' },
                      { num: statsSaved.game, lbl: '🎮 Games saved', color: 'var(--game)' },
                      { num: lists.length, lbl: 'Lists', color: 'var(--accent)' },
                      { num: totalStamps, lbl: '⭐ Stamps received', color: '#f0c040' },
                    ].map(s => (
                      <div key={s.lbl}>
                        <div style={{ fontFamily:'var(--font-display)', fontSize:'1.7rem', fontWeight:700, color: s.color }}>{s.num}</div>
                        <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.7rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION SWITCHER ── */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:28 }}>
          {[['shelf','🔖 Saved Shelf'],['lists','📋 My Lists'],['taste','🎯 Taste Profile']].map(([k,l]) => (
            <button key={k} onClick={()=>setActiveSection(k)}
              style={{ padding:'12px 22px', fontSize:'0.86rem', fontWeight:600, fontFamily:'var(--font-ui)', cursor:'pointer', border:'none', background:'none', borderBottom:`2px solid ${activeSection===k?'var(--accent)':'transparent'}`, color:activeSection===k?'var(--accent)':'var(--text3)', marginBottom:-1, transition:'color 0.15s, border-color 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── SAVED SHELF (categorical) ── */}
        {activeSection === 'shelf' && (
          <div>
            <div style={{ display:'flex', gap:0, marginBottom:24, background:'var(--surface)', borderRadius:12, padding:4, width:'fit-content' }}>
              {TABS.map(t => (
                <button key={t} onClick={()=>setShelfTab(t)}
                  style={{ padding:'8px 20px', borderRadius:10, fontFamily:'var(--font-ui)', fontSize:'0.84rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s', background: shelfTab===t ? (t==='books'?'var(--book)':t==='films'?'var(--film)':'var(--game)') : 'none', color: shelfTab===t ? (t==='books'||t==='films'?'#fff':'#001a14') : 'var(--text3)' }}>
                  {t==='books'?'📚 Books':t==='films'?'🎬 Films':'🎮 Games'} ({shelfByType(t==='books'?'book':t==='films'?'film':'game').length})
                </button>
              ))}
            </div>
            <ShelfGrid items={shelfByType(shelfTab==='books'?'book':shelfTab==='films'?'film':'game')} onRemove={onRemove} lists={lists} onAddToList={onGoDiscover} />
          </div>
        )}

        {/* ── MY LISTS ── */}
        {activeSection === 'lists' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', gap:0, background:'var(--surface)', borderRadius:12, padding:4 }}>
                {TABS.map(t => (
                  <button key={t} onClick={()=>setListTab(t)}
                    style={{ padding:'8px 18px', borderRadius:10, fontFamily:'var(--font-ui)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s', background: listTab===t ? (t==='books'?'var(--book)':t==='films'?'var(--film)':'var(--game)') : 'none', color: listTab===t ? (t==='books'||t==='films'?'#fff':'#001a14') : 'var(--text3)' }}>
                    {t==='books'?'📚':t==='films'?'🎬':'🎮'} {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={()=>setShowNewList(true)}>+ New List</button>
            </div>

            {showNewList && (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:20, marginBottom:20, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                <input value={newListName} onChange={e=>setNewListName(e.target.value)} placeholder='List name e.g. "Top 10 Movies"'
                  style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'9px 14px', color:'var(--text)', fontSize:'0.9rem', fontFamily:'var(--font-body)', minWidth:180 }}
                  onKeyDown={e=>{ if(e.key==='Enter'&&newListName.trim()){ onCreateList(newListName.trim(), listTab==='books'?'book':listTab==='films'?'film':'game'); setNewListName(''); setShowNewList(false); }}}/>
                <button className="btn btn-primary btn-sm" onClick={()=>{ if(newListName.trim()){ onCreateList(newListName.trim(), listTab==='books'?'book':listTab==='films'?'film':'game'); setNewListName(''); setShowNewList(false); }}}>Create</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>{ setShowNewList(false); setNewListName(''); }}>Cancel</button>
              </div>
            )}

            {listsByType(listTab==='books'?'book':listTab==='films'?'film':'game').length === 0 ? (
              <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:12, opacity:0.4 }}>📋</div>
                <p>No {listTab} lists yet. Create one above!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {listsByType(listTab==='books'?'book':listTab==='films'?'film':'game').map(list => (
                  <div key={list.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:22 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:12, flexWrap:'wrap' }}>
                      {renamingListId === list.id ? (
                        <div style={{ display:'flex', gap:8, flex:1 }}>
                          <input value={renameVal} onChange={e=>setRenameVal(e.target.value)} autoFocus
                            style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--accent)', borderRadius:8, padding:'7px 12px', color:'var(--text)', fontSize:'0.9rem', fontFamily:'var(--font-body)' }}
                            onKeyDown={e=>{ if(e.key==='Enter'){ onRenameList(list.id, renameVal); setRenamingListId(null); }}}/>
                          <button className="btn btn-primary btn-sm" onClick={()=>{ onRenameList(list.id,renameVal); setRenamingListId(null); }}>Save</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setRenamingListId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:600 }}>{list.name}</h3>
                          <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'var(--text3)', background:'var(--surface2)', padding:'2px 8px', borderRadius:999 }}>{list.items?.length||0} items</span>
                        </div>
                      )}
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>{ setRenamingListId(list.id); setRenameVal(list.name); }} title="Rename"
                          style={{ padding:'5px 12px', borderRadius:999, border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--text2)', fontSize:'0.76rem', cursor:'pointer', fontFamily:'var(--font-ui)' }}>✏️ Rename</button>
                        <button onClick={()=>onDeleteList(list.id)} title="Delete list"
                          style={{ padding:'5px 12px', borderRadius:999, border:'1px solid rgba(224,84,122,0.3)', background:'rgba(224,84,122,0.08)', color:'var(--film)', fontSize:'0.76rem', cursor:'pointer', fontFamily:'var(--font-ui)' }}>🗑 Delete</button>
                      </div>
                    </div>
                    {(!list.items||list.items.length===0) ? (
                      <p style={{ color:'var(--text3)', fontSize:'0.84rem', fontFamily:'var(--font-ui)', fontStyle:'italic' }}>No items yet. Add from search results.</p>
                    ) : (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12 }}>
                        {list.items.map(item => (
                          <div key={item.id} style={{ background:'var(--surface2)', borderRadius:14, padding:14, position:'relative', borderTop:`2px solid ${TYPE_COLOR[item.type]||'var(--accent)'}` }}>
                            <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{TYPE_LABEL[item.type]||item.type}</div>
                            <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:600, lineHeight:1.25, marginBottom:4 }}>{item.title}</div>
                            <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.75rem', color:'var(--text3)' }}>{item.meta}</div>
                            <button onClick={()=>onRemoveFromList(list.id, item.id)} title="Remove from list"
                              style={{ position:'absolute', top:10, right:10, width:22, height:22, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text3)', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:0, transition:'opacity 0.15s' }}
                              onMouseEnter={e=>{ e.currentTarget.style.opacity=1; e.currentTarget.style.borderColor='var(--film)'; e.currentTarget.style.color='var(--film)'; }}
                              onMouseLeave={e=>{ e.currentTarget.style.opacity=0; }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TASTE PROFILE ── */}
        {activeSection === 'taste' && (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:24, padding:32 }}>
            <div style={{ marginBottom:24 }}>
              <h2 className="display" style={{ fontSize:'1.5rem', fontWeight:600, marginBottom:6 }}>🎯 Taste Profile & Radar</h2>
              <p style={{ fontSize:'0.84rem', color:'var(--text2)' }}>Built from your feedback — grows smarter with every 👍👎 reaction.</p>
            </div>
            {tasteEntries.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>
                <div style={{ fontSize:'2rem', marginBottom:12, opacity:0.4 }}>🎯</div>
                <p>Rate recommendations with 👍/👎 to build your taste profile.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'start' }}>
                <div>
                  <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.74rem', color:'var(--text3)', marginBottom:12, textAlign:'center', textTransform:'uppercase', letterSpacing:'0.08em' }}>Genre Affinity Radar</p>
                  {radarData.length >= 3 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData} margin={{ top:10,right:30,bottom:10,left:30 }}>
                        <PolarGrid stroke="var(--border)"/>
                        <PolarAngleAxis dataKey="tag" tick={{ fill:'var(--text3)', fontSize:10, fontFamily:'var(--font-ui)' }}/>
                        <Radar name="Affinity" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.22} strokeWidth={2}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : <p style={{ textAlign:'center', color:'var(--text3)', fontSize:'0.82rem', padding:'40px 0' }}>Rate more items to see the radar</p>}
                </div>
                <div>
                  {tasteEntries.filter(([,v])=>v>0).slice(0,8).length>0 && <>
                    <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', fontWeight:700, color:'var(--game2)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>You Love</p>
                    {tasteEntries.filter(([,v])=>v>0).slice(0,8).map(([tag,val])=>(
                      <div key={tag} style={{ display:'grid', gridTemplateColumns:'130px 1fr 40px', alignItems:'center', gap:10, marginBottom:10 }}>
                        <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.76rem', fontWeight:600, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={tag}>{tag}</span>
                        <div style={{ height:6, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}><div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,var(--game),var(--accent))', width:`${Math.min(100,val*100)}%`, transition:'width 0.8s ease' }}/></div>
                        <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', fontWeight:700, color:'var(--text3)', textAlign:'right' }}>{Math.round(val*100)}%</span>
                      </div>
                    ))}
                  </>}
                  {tasteEntries.filter(([,v])=>v<0).slice(0,4).length>0 && <>
                    <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', fontWeight:700, color:'var(--film2)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'20px 0 12px' }}>Not Your Vibe</p>
                    {tasteEntries.filter(([,v])=>v<0).slice(0,4).map(([tag,val])=>(
                      <div key={tag} style={{ display:'grid', gridTemplateColumns:'130px 1fr 40px', alignItems:'center', gap:10, marginBottom:10 }}>
                        <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.76rem', fontWeight:600, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tag}</span>
                        <div style={{ height:6, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}><div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,var(--film),#a03050)', width:`${Math.min(100,Math.abs(val)*100)}%`, transition:'width 0.8s ease' }}/></div>
                        <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', fontWeight:700, color:'var(--film2)', textAlign:'right' }}>{Math.round(Math.abs(val)*100)}%</span>
                      </div>
                    ))}
                  </>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ShelfGrid({ items, onRemove }) {
  if (items.length === 0) return (
    <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:12, opacity:0.4 }}>📭</div>
      <p>Nothing saved here yet. Go discover something!</p>
    </div>
  );
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px,1fr))', gap:16 }}>
      {items.map(item => (
        <div key={item.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderTop:`3px solid ${TYPE_COLOR[item.type]||'var(--accent)'}`, borderRadius:16, padding:18, position:'relative', display:'flex', flexDirection:'column', gap:8, transition:'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.4)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
          <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.66rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text3)' }}>{TYPE_LABEL[item.type]||item.type}</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, lineHeight:1.25 }}>{item.title}</div>
          <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.76rem', color:'var(--text3)' }}>{item.meta}</div>
          {item.tags && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:4 }}>
              {item.tags.slice(0,3).map(t=>(
                <span key={t} style={{ fontSize:'0.65rem', padding:'2px 7px', background:'var(--surface2)', borderRadius:999, color:'var(--text3)', fontFamily:'var(--font-ui)' }}>{t}</span>
              ))}
            </div>
          )}
          <button onClick={()=>onRemove(item.id)} title="Remove from shelf"
            style={{ position:'absolute', top:10, right:10, width:24, height:24, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text3)', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:0, transition:'opacity 0.15s, border-color 0.15s, color 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.opacity=1; e.currentTarget.style.borderColor='var(--film)'; e.currentTarget.style.color='var(--film)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.opacity=0; }}>✕</button>
        </div>
      ))}
    </div>
  );
}
