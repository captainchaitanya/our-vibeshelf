import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useShelf } from './hooks/useShelf';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import DiscoveryPage from './pages/DiscoveryPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';

function AppInner() {
  const { user } = useAuth();
  const { shelf, lists, tasteProfile, feedbackMap, load, saveItem, removeItem, isSaved, createList, renameList, deleteList, addToList, removeFromList, sendFeedback, reset } = useShelf();
  const [page, setPage] = useState('home');
  const [discoMode, setDiscoMode] = useState('all');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [publicUsername, setPublicUsername] = useState(null);

  useEffect(() => { if (user) load(); else reset(); }, [user]);

  const nav = (p, extra) => {
    setPage(p);
    if (p === 'public-profile' && extra) setPublicUsername(extra);
    window.scrollTo(0, 0);
  };
  const openLogin = (mode='login') => { setAuthMode(mode); setAuthOpen(true); };
  const handleSelectMode = (mode) => { setDiscoMode(mode); setPage('disco'); };

  const handleSave = async (title) => {
    if (!user) { openLogin('signup'); return; }
    if (isSaved(title.id)) await removeItem(title.id);
    else await saveItem(title);
  };

  return (
    <div>
      <Header onNav={nav} onLoginClick={openLogin} currentPage={page} />

      {page === 'home' && <HomePage onSelectMode={handleSelectMode} />}
      {page === 'disco' && (
        <DiscoveryPage mode={discoMode} onBack={()=>setPage('home')}
          shelf={shelf} lists={lists} isSaved={isSaved}
          onSave={handleSave}
          onFeedback={(id,dir,tags)=>{ if(user) sendFeedback(id,dir,tags); }}
          feedbackMap={feedbackMap} tasteProfile={tasteProfile}
          onAddToList={(listId,item)=>addToList(listId,item)}
          onCreateList={async(name,type)=>{ await createList(name,type); }}
        />
      )}
      {page === 'profile' && (
        <ProfilePage shelf={shelf} lists={lists} tasteProfile={tasteProfile}
          onRemove={removeItem}
          onGoDiscover={()=>{ setDiscoMode('all'); setPage('disco'); }}
          onRenameList={renameList} onDeleteList={deleteList}
          onRemoveFromList={removeFromList}
          onCreateList={createList}
        />
      )}
      {page === 'public-profile' && publicUsername && (
        <PublicProfilePage username={publicUsername} onBack={()=>setPage('home')} />
      )}

      <AuthModal open={authOpen} mode={authMode} onClose={()=>setAuthOpen(false)} />

      {page !== 'profile' && page !== 'public-profile' && (
        <footer style={{ borderTop:'1px solid var(--border)', padding:'28px 0', marginTop:60 }}>
          <div className="wrap" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.82rem', color:'var(--text3)', fontFamily:'var(--font-ui)' }}>
              <strong style={{ color:'var(--text2)' }}>Vibeshelf</strong> — AI vibe matching · 547 curated titles · Powered by Llama 3 via Groq
            </span>
            <span style={{ display:'flex', gap:20 }}>
              {[['books','📚'],['films','🎬'],['games','🎮']].map(([m,e])=>(
                <span key={m} style={{ cursor:'pointer', fontSize:'0.82rem', color:'var(--text3)', fontFamily:'var(--font-ui)' }} onClick={()=>handleSelectMode(m)}>{e} {m.charAt(0).toUpperCase()+m.slice(1)}</span>
              ))}
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
