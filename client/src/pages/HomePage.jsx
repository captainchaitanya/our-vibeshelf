import { TITLES } from '../data/titles';

const MODES = [
  {
    key: 'books',
    icon: '📚',
    label: 'Books',
    desc: 'From sweeping epics to cozy mysteries — find your next literary obsession.',
    className: 'book',
    color: 'var(--book2)',
  },
  {
    key: 'films',
    icon: '🎬',
    label: 'Movies & TV',
    desc: 'Cult classics, prestige dramas, animated masterpieces — matched to your mood.',
    className: 'film',
    color: 'var(--film2)',
  },
  {
    key: 'games',
    icon: '🎮',
    label: 'Games',
    desc: 'Indie gems to sprawling RPGs — find your next 100-hour obsession.',
    className: 'game',
    color: 'var(--game2)',
  },
];

const counts = {
  books: TITLES.filter(t => t.type === 'book').length,
  films: TITLES.filter(t => t.type === 'film').length,
  games: TITLES.filter(t => t.type === 'game').length,
};

export default function HomePage({ onSelectMode }) {
  return (
    <div>
      <section className="home-hero">
        <div className="wrap-narrow">
          <p className="hero-eyebrow">AI-powered taste matching</p>
          <h1 className="hero-title">
            Your next <em>obsession</em><br />is one vibe away
          </h1>
          <p className="hero-sub">
            Describe the feeling you're chasing — in any words, however vague or specific —
            and Vibeshelf's AI finds books, films, and games that perfectly match.
          </p>

          <div className="mode-grid">
            {MODES.map(m => (
              <div key={m.key} className={`mode-card ${m.className}`}
                onClick={() => onSelectMode(m.key)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onSelectMode(m.key)}>

                {/* Decorative SVG */}
                <svg className="mode-card-deco" viewBox="0 0 120 120" fill="none">
                  <circle cx="100" cy="20" r="60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" fill="none" />
                  <circle cx="100" cy="20" r="40" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                </svg>

                <span className="mode-icon">{m.icon}</span>
                <span className="mode-card-label">{m.label}</span>
                <p className="mode-card-desc">{m.desc}</p>
                <span className="mode-card-count">
                  {counts[m.key]}+ titles · AI picks unlimited
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button className="btn btn-ghost" onClick={() => onSelectMode('all')}>
              ✨ Browse everything at once →
            </button>
          </div>

          <div className="features-strip">
            {[
              'AI understands any description',
              'Handles typos & fuzzy references',
              'Reinforcement learning from your feedback',
              'Taste profile that grows with you',
            ].map(f => (
              <div key={f} className="feature-item">
                <span className="feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent picks teaser */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="wrap">
          <h2 className="section-title display" style={{ marginBottom: 6 }}>What people are discovering</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: '0.9rem' }}>
            A sample of what the vibe engine surfaces — for your next search.
          </p>
          <div className="scroll-row">
            {TITLES.slice(0, 10).map(t => {
              const clr = { book: 'var(--book)', film: 'var(--film)', game: 'var(--game)' }[t.type];
              return (
                <div key={t.id}
                  style={{ flexShrink: 0, width: 200, background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${clr}`, borderRadius: 16, padding: '16px', cursor: 'default' }}>
                  <span className={`badge badge-${t.type}`} style={{ marginBottom: 10, display: 'inline-block' }}>{t.type}</span>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 4, lineHeight: 1.25 }}>{t.title}</p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text3)', fontFamily: 'var(--font-ui)' }}>{t.meta}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
