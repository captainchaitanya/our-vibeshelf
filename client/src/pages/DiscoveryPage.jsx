import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import ResultCard from '../components/ResultCard';
import { TAGS, TITLES } from '../data/titles';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const MODE_CONFIG = {
  books:  { label:'Books',       emoji:'📚', cls:'book',  color:'var(--book)',   color2:'var(--book2)',  btnCls:'btn-book',    examples:['Like Narnia — wonder, found family, real stakes','Brandon Sanderson epic — hard magic, betrayal, hope','Cozy mystery, small English village, amateur sleuth'] },
  films:  { label:'Movies & TV', emoji:'🎬', cls:'film',  color:'var(--film)',   color2:'var(--film2)',  btnCls:'btn-film',    examples:['Psychological thriller — reality slowly unraveling','Mind-bending Sci-Fi like Inception','Prestige war drama with moral complexity'] },
  games:  { label:'Games',       emoji:'🎮', cls:'game',  color:'var(--game)',   color2:'var(--game2)',  btnCls:'btn-game',    examples:['Dark Souls atmosphere — punishing, lore-rich','Cozy RPG with wholesome found family vibes','Tactical strategy with political intrigue and betrayal'] },
  all:    { label:'All',         emoji:'✨', cls:'all',   color:'var(--accent)', color2:'var(--accent2)',btnCls:'btn-primary', examples:['Narnia vibes — wonder, honour, grit, found family','Dark and melancholic like NieR or Pan\'s Labyrinth','Wholesome Miyazaki-style — magic, warmth, adventure'] },
};

// Local keyword fallback
const KW = {
  'Epic Fantasy':['epic fantasy','tolkien','lord of the rings','lotr','narnia','nrania','stormlight','wheel of time','dune'],
  'Dark & Gritty':['dark','gritty','brutal','grim','punishing','bleak','dark souls','elden ring','grimdark'],
  'Found Family':['found family','family','companions','fellowship','crew','party','friends','bond','together'],
  'Magic & Sorcery':['magic','magical','sorcery','spell','wizard','witch','enchant','harry potter','hogwarts'],
  'Coming of Age':['coming of age','grow up','growing up','young','teen','orphan','chosen one'],
  'Cozy & Wholesome':['cozy','cosy','warm','comfort','wholesome','gentle','miyazaki','ghibli','heartwarming','slice of life'],
  'Mystery & Suspense':['mystery','suspense','detective','thriller','whodunit','sherlock','agatha christie'],
  'Sci-Fi & Futuristic':['sci-fi','science fiction','space','future','robot','android','dystopia','cyberpunk','interstellar'],
  'Romance':['romance','romantic','love','heartbreak','relationship'],
  'Horror':['horror','scary','terrifying','nightmare','lovecraft','eldritch'],
  'Action & Adventure':['action','adventure','quest','journey','battle','fight','warrior'],
  'Philosophical':['philosophy','existential','meaning','purpose','identity','consciousness','deep'],
  'Historical':['historical','history','medieval','ancient','victorian','war period','feudal'],
  'Psychological':['psychological','mind','unreliable narrator','mind-bending','paranoia','trauma'],
  'Mythology':['mythology','myth','legend','gods','greek','norse','folklore'],
  'Post-Apocalyptic':['post-apocalyptic','apocalypse','end of world','survival','fallout','wasteland'],
  'Political Intrigue':['political','politics','intrigue','power','court','scheming','game of thrones'],
  'Heist':['heist','robbery','con','scheme','caper'],
  'Thriller':['thriller','tense','edge of seat','chase','danger'],
};

function localDetect(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  Object.entries(KW).forEach(([tag, words]) => { if (words.some(w => lower.includes(w))) found.add(tag); });
  return [...found];
}

function jaccard(a, b) {
  const sa = new Set(a), sb = new Set(b);
  const inter = [...sa].filter(x => sb.has(x));
  const union = new Set([...sa, ...sb]);
  return union.size === 0 ? 0 : inter.length / union.size;
}

function filterByMode(titles, mode) {
  if (mode === 'all') return titles;
  const map = { books:'book', films:'film', games:'game' };
  return titles.filter(t => t.type === map[mode]);
}

// AddToList modal
function AddToListModal({ item, lists, onAdd, onCreate, onClose }) {
  const [newName, setNewName] = useState('');
  const typeMap = { book:'books', film:'films', game:'games' };
  const relevant = lists.filter(l => l.type === item.type || l.type === 'all');
  return (
    <div className="modal-overlay open" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:400 }}>
        <button onClick={onClose} style={{ position:'absolute',top:16,right:16,width:32,height:32,borderRadius:'50%',border:'1px solid var(--border)',background:'var(--bg2)',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',cursor:'pointer' }}>×</button>
        <h3 className="display" style={{ fontSize:'1.2rem', marginBottom:6 }}>Add to List</h3>
        <p style={{ fontSize:'0.84rem', color:'var(--text2)', marginBottom:20, fontFamily:'var(--font-ui)' }}>"{item.title}"</p>
        {relevant.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {relevant.map(l=>(
              <button key={l.id} onClick={()=>{ onAdd(l.id, item); onClose(); }}
                style={{ padding:'10px 16px', borderRadius:12, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text)', fontFamily:'var(--font-ui)', fontSize:'0.86rem', fontWeight:600, cursor:'pointer', textAlign:'left', transition:'border-color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                📋 {l.name} <span style={{ color:'var(--text3)', fontWeight:400 }}>({l.items?.length||0} items)</span>
              </button>
            ))}
          </div>
        ) : <p style={{ color:'var(--text3)', fontSize:'0.84rem', marginBottom:16, fontFamily:'var(--font-ui)' }}>No lists for this type yet.</p>}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
          <p style={{ fontSize:'0.78rem', color:'var(--text3)', fontFamily:'var(--font-ui)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>Create new list</p>
          <div style={{ display:'flex', gap:8 }}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder='e.g. "Top 10 Movies"'
              style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'9px 12px', color:'var(--text)', fontSize:'0.88rem', fontFamily:'var(--font-body)' }}
              onKeyDown={e=>{ if(e.key==='Enter'&&newName.trim()){ onCreate(newName.trim(), item.type); onClose(); }}}/>
            <button className="btn btn-primary btn-sm" onClick={()=>{ if(newName.trim()){ onCreate(newName.trim(), item.type); onClose(); }}}>Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoveryPage({ mode, onBack, shelf, lists, isSaved, onSave, onFeedback, feedbackMap, tasteProfile, onAddToList, onCreateList }) {
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.all;
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [activeTags, setActiveTags] = useState(new Set());
  const [thinking, setThinking] = useState(false);
  const [detectedTags, setDetectedTags] = useState([]);
  const [results, setResults] = useState(null);
  const [aiCards, setAiCards] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [listModal, setListModal] = useState(null); // item to add to list
  const resultsRef = useRef(null);

  const toggleTag = (tag) => setActiveTags(prev => { const n=new Set(prev); n.has(tag)?n.delete(tag):n.add(tag); return n; });

  const getTagBoost = (tags) => tags.reduce((s,t) => s+(tasteProfile?.[t]||0)*0.06, 0);

  const computeResults = useCallback((queryTags) => {
    const pool = filterByMode(TITLES, mode);
    return pool.map(t => {
      const base = jaccard([...queryTags], t.tags);
      const boost = getTagBoost(t.tags);
      const neg = feedbackMap?.[t.id]==='down' ? -0.15 : 0;
      const score = Math.max(0, Math.min(1, base+boost+neg));
      return { title:t, score, shared:t.tags.filter(tag=>queryTags.has(tag)) };
    }).sort((a,b)=>b.score-a.score);
  }, [mode, tasteProfile, feedbackMap]);

  const fetchAiPicks = async (queryTags) => {
    setAiLoading(true);
    try {
      const r = await axios.post(`${API_BASE}/llm/ai-picks`, { tags:[...queryTags], mode, count:9 });
      setAiCards(Array.isArray(r.data) ? r.data : []);
    } catch { setAiCards([]); }
    finally { setAiLoading(false); }
  };

  const handleFind = async () => {
    const combined = new Set(activeTags);
    if (text.trim().length > 2) {
      setThinking(true);
      try {
        const r = await axios.post(`${API_BASE}/llm/detect-tags`, { text:text.trim(), tags:TAGS });
        (r.data.tags||[]).forEach(t=>combined.add(t));
      } catch { localDetect(text).forEach(t=>combined.add(t)); }
      finally { setThinking(false); }
      localDetect(text).forEach(t=>combined.add(t));
    }
    if (combined.size===0) { alert('Try describing a mood, genre, or reference title.'); return; }
    const newDetected = [...combined].filter(t=>!activeTags.has(t));
    setDetectedTags(newDetected); setActiveTags(combined);
    setResults(computeResults(combined)); setDetail(null); setActiveTab('all');
    await fetchAiPicks(combined);
    setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100);
  };

  const filteredResults = results
    ? (activeTab==='all' ? results : results.filter(r=>r.title.type==={'books':'book','films':'film','games':'game'}[activeTab]||r.title.type===activeTab))
    : [];
  const tabCounts = results
    ? {all:results.length, book:results.filter(r=>r.title.type==='book').length, film:results.filter(r=>r.title.type==='film').length, game:results.filter(r=>r.title.type==='game').length}
    : {all:0,book:0,film:0,game:0};

  return (
    <div style={{ minHeight:'100vh' }}>
      <div className="wrap" style={{ paddingTop:32, paddingBottom:80 }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-ui)', fontSize:'0.82rem', color:'var(--text3)', marginBottom:28 }}>
          <button onClick={onBack} style={{ color:'var(--accent)', fontWeight:600, fontFamily:'var(--font-ui)', fontSize:'0.82rem', background:'none', border:'none', cursor:'pointer' }}>← Home</button>
          <span>/</span><span>{cfg.label}</span>
        </div>

        {/* Banner */}
        <div className={`disco-banner ${cfg.cls}`} style={{ marginBottom:28 }}>
          <div className="disco-banner-inner">
            <span style={{ fontSize:'3.5rem', flexShrink:0 }}>{cfg.emoji}</span>
            <div>
              <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:8, color:cfg.color2 }}>{cfg.label} · AI Vibe Matching via Llama 3</p>
              <h1 className="display" style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:700, lineHeight:1.1, marginBottom:10 }}>
                {mode==='books'?<>Find your next <em>read</em></>:mode==='films'?<>Find your next <em>watch</em></>:mode==='games'?<>Find your next <em>play</em></>:<>Discover your next <em>obsession</em></>}
              </h1>
              <p style={{ fontSize:'0.92rem', color:'var(--text2)', lineHeight:1.6 }}>Describe any vibe — Llama 3 via Groq decodes it into perfect matches from 547 titles.</p>
            </div>
          </div>
        </div>

        {/* Vibe panel */}
        <div className={`vibe-panel ${cfg.cls}`} style={{ marginBottom:28 }}>
          <p className="vibe-label">Describe the vibe you're after <span className="ai-pill">🦙 Llama 3 · Groq</span></p>
          <textarea className={`vibe-textarea ${cfg.cls}`} value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleFind();} }}
            placeholder={`e.g. ${cfg.examples[0]}`} rows={3}/>
          <div className="example-row">
            <span className="example-label">Try:</span>
            {cfg.examples.map((ex,i)=>(
              <button key={i} className="example-pill" onClick={()=>setText(ex)}>{ex.length>40?ex.slice(0,38)+'…':ex}</button>
            ))}
          </div>
          <div className="tag-cloud">
            <p className="tag-cloud-label">Or pick vibes directly</p>
            <div className="tag-cloud-chips">
              {TAGS.map(tag=>(
                <button key={tag} className={`chip ${activeTags.has(tag)?`${cfg.cls}-active`:''}`} onClick={()=>toggleTag(tag)}>{tag}</button>
              ))}
            </div>
          </div>
          <div className="vibe-actions">
            <button className={`btn ${cfg.btnCls}`} onClick={handleFind} disabled={thinking}>
              {thinking?(
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ display:'flex', gap:4 }}>{[0,1,2].map(i=><span key={i} style={{ width:6,height:6,borderRadius:'50%',background:'currentColor',animation:`pulse 1.2s ease infinite`,animationDelay:`${i*0.2}s`,display:'inline-block' }}/>)}</span>
                  Llama 3 thinking…
                </span>
              ):'🔍 Find my vibe'}
            </button>
            <span className="vibe-hint">{activeTags.size>0?`${activeTags.size} vibes selected`:'AI matches from 547 curated titles + live AI picks'}</span>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div ref={resultsRef}>
            {detectedTags.length>0 && (
              <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.74rem', color:'var(--text3)' }}>Llama 3 detected:</span>
                {detectedTags.map(tag=>(
                  <button key={tag} onClick={()=>{ setDetectedTags(p=>p.filter(t=>t!==tag)); setActiveTags(p=>{const n=new Set(p);n.delete(tag);return n;}); }}
                    style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:'var(--font-ui)', fontSize:'0.74rem', fontWeight:600, padding:'4px 10px 4px 12px', borderRadius:999, background:'rgba(201,168,76,0.12)', color:'var(--accent2)', border:'1px solid rgba(201,168,76,0.2)', cursor:'pointer' }}>
                    {tag} <span style={{ opacity:0.6 }}>×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Detail panel */}
            {detail && (
              <div className={`detail-panel ${detail.title.type}`} style={{ marginBottom:28 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:12, padding:8 }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {[...activeTags].slice(0,8).map(tag=>(
                      <span key={tag} style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', padding:'4px 10px', borderRadius:999, background: detail.title.tags.includes(tag)?'rgba(201,168,76,0.2)':'var(--surface2)', color: detail.title.tags.includes(tag)?'var(--accent2)':'var(--text3)', border:`1px solid ${detail.title.tags.includes(tag)?'rgba(201,168,76,0.3)':'var(--border)'}` }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="detail-eyebrow">{Math.round(detail.score*100)}% match · {detail.title.genre}</p>
                  <h2 className="display detail-title">{detail.title.title}</h2>
                  <p className="detail-meta">{detail.title.meta}</p>
                  <p className="detail-blurb">{detail.title.blurb}</p>
                  {detail.shared.length>0&&<p className="detail-shared">Shares <strong>{detail.shared.join(', ')}</strong> with your vibe.</p>}
                  <div className="detail-actions">
                    <button className={`btn btn-sm ${isSaved(detail.title.id)?'btn-ghost':'btn-primary'}`} onClick={()=>{ if(!user){alert('Log in to save!');return;} onSave(detail.title); }}>
                      {isSaved(detail.title.id)?'✅ Saved':'🔖 Save to shelf'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setListModal(detail.title)}>📋 Add to list</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setDetail(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs (all mode) */}
            {mode==='all' && (
              <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:22 }}>
                {[{key:'all',label:`All (${tabCounts.all})`},{key:'book',label:`📚 Books (${tabCounts.book})`,cls:'book-tab'},{key:'film',label:`🎬 Films (${tabCounts.film})`,cls:'film-tab'},{key:'game',label:`🎮 Games (${tabCounts.game})`,cls:'game-tab'}].map(({key,label,cls})=>(
                  <button key={key} className={`tab-btn ${cls||''} ${activeTab===key?'active':''}`} onClick={()=>setActiveTab(key)}>{label}</button>
                ))}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:12 }}>
              <h2 className="display" style={{ fontSize:'clamp(1.3rem,3vw,1.8rem)', fontWeight:600 }}>{filteredResults.length} matches</h2>
              <p style={{ fontSize:'0.82rem', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>Sorted by vibe match · 👍👎 feedback re-ranks results</p>
            </div>

            <div className="results-grid">
              {filteredResults.map((match,i)=>(
                <ResultCard key={match.title.id} match={match} activeTags={activeTags}
                  isSaved={isSaved(match.title.id)} feedback={feedbackMap?.[match.title.id]}
                  onSave={t=>{ if(!user){alert('Log in to save!');return;} onSave(t); }}
                  onFeedback={(id,dir,tags)=>{ if(user) onFeedback(id,dir,tags); }}
                  onAddToList={t=>{ if(!user){alert('Log in to use lists!');return;} setListModal(t); }}
                  onClick={m=>setDetail(m)}
                  style={{ animationDelay:`${i*30}ms` }}/>
              ))}
            </div>

            {/* AI Picks */}
            <div style={{ marginBottom:48, marginTop:12 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap', marginBottom:10 }}>
                <h2 className="display" style={{ fontSize:'clamp(1.3rem,3vw,1.8rem)', fontWeight:600 }}>🦙 Llama 3 Fresh Picks</h2>
                <span className="badge badge-ai">Live via Groq</span>
              </div>
              <p style={{ fontSize:'0.84rem', color:'var(--text2)', marginBottom:18 }}>Generated by Llama 3.3-70B on Groq — beyond the curated library, fresh every time.</p>
              {aiLoading ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
                  {[0,1,2].map(i=><div key={i} style={{ height:180, background:'var(--surface2)', borderRadius:16, position:'relative', overflow:'hidden' }}><div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)', backgroundSize:'200% 100%', animation:'shimmer 1.4s ease-in-out infinite' }}/></div>)}
                </div>
              ) : aiCards.length>0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
                  {aiCards.map((card,i)=>(
                    <div key={i} className="ai-card" style={{ animationDelay:`${i*50}ms` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span className={`badge badge-${card.type||'ai'}`}>{card.genre||card.type}</span>
                        <span className="badge badge-ai">🦙 Llama 3</span>
                      </div>
                      <p className="ai-card-title display">{card.title}</p>
                      <p style={{ fontSize:'0.78rem', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>{card.meta}</p>
                      <p className="ai-card-blurb">{card.blurb}</p>
                      <p className="ai-card-why">"{card.why}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding:'30px 20px', background:'var(--surface)', borderRadius:16, border:'1px solid var(--border)', textAlign:'center' }}>
                  <p style={{ color:'var(--text3)', fontSize:'0.86rem', fontFamily:'var(--font-ui)' }}>Add your GROQ_API_KEY to server/.env to enable Llama 3 live picks.</p>
                </div>
              )}
              {aiCards.length>0 && <button className="btn btn-ghost btn-sm" style={{ marginTop:14 }} onClick={()=>fetchAiPicks(activeTags)}>🦙 Refresh Llama 3 picks</button>}
            </div>
          </div>
        )}
      </div>

      {/* Add to list modal */}
      {listModal && (
        <AddToListModal item={listModal} lists={lists}
          onAdd={(listId,item)=>onAddToList(listId,item)}
          onCreate={(name,type)=>onCreateList(name,type)}
          onClose={()=>setListModal(null)}/>
      )}
    </div>
  );
}
