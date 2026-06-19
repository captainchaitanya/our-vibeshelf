const C = { book: 'var(--book)', film: 'var(--film)', game: 'var(--game)' };
const circ = 2 * Math.PI * 20;

export default function ResultCard({ match, activeTags, isSaved, feedback, onSave, onFeedback, onClick, onAddToList, style }) {
  const { title: t, score } = match;
  const pct = Math.round(score * 100);
  const offset = circ * (1 - score);
  const color = C[t.type];

  return (
    <article className={`result-card ${t.type}`} style={style} onClick={() => onClick?.(match)}>
      <div className="result-card-header">
        <span className={`badge badge-${t.type}`}>{t.genre || t.type}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="match-ring">
            <svg viewBox="0 0 48 48" width="52" height="52">
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--surface2)" strokeWidth="3"/>
              <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
            </svg>
            <span className="match-ring-label" style={{ color }}>{pct}%</span>
          </div>
          {/* Add to list button */}
          <button title="Add to My List" onClick={e => { e.stopPropagation(); onAddToList?.(t); }}
            style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--game)'; e.currentTarget.style.color = 'var(--game)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          {/* Save button */}
          <button className={`save-btn-card ${isSaved ? 'saved' : ''}`} onClick={e => { e.stopPropagation(); onSave?.(t); }} title={isSaved ? 'Remove from shelf' : 'Save to shelf'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </button>
        </div>
      </div>
      <div className="result-card-body">
        <div><h3 className="result-card-title">{t.title}</h3><p className="result-card-meta">{t.meta}</p></div>
        <p className="result-card-blurb">{t.blurb}</p>
        <div className="result-card-tags">{t.tags.map(tag => <span key={tag} className={`result-tag ${activeTags?.has(tag) ? 'match' : ''}`}>{tag}</span>)}</div>
      </div>
      <div className="card-footer" onClick={e => e.stopPropagation()}>
        <span className="fb-label">This hit?</span>
        <button className={`fb-btn up ${feedback==='up'?'active':''}`} onClick={() => onFeedback?.(t.id,'up',t.tags)}>👍</button>
        <button className={`fb-btn down ${feedback==='down'?'active':''}`} onClick={() => onFeedback?.(t.id,'down',t.tags)}>👎</button>
      </div>
    </article>
  );
}
