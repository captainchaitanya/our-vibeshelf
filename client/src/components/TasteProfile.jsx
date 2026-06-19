import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const GENRE_GROUPS = {
  'Narrative': ['Epic Fantasy','Dark & Gritty','Cozy & Wholesome','Philosophical'],
  'Tone': ['Mystery & Suspense','Horror','Romance','Action & Adventure'],
  'Setting': ['Sci-Fi & Futuristic','Historical','Post-Apocalyptic','Mythology'],
  'Theme': ['Found Family','Coming of Age','Political Intrigue','Heist'],
};

export default function TasteProfile({ tasteProfile }) {
  const entries = Object.entries(tasteProfile || {}).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const hasData = entries.length > 0;

  // Build recharts radar data from top tags
  const radarData = entries.slice(0, 10).map(([tag, val]) => ({
    tag: tag.length > 14 ? tag.slice(0, 13) + '…' : tag,
    fullTag: tag,
    value: Math.max(0, (val + 1) / 2 * 100), // normalize -1..1 → 0..100
  }));

  const topPositive = entries.filter(([, v]) => v > 0).slice(0, 8);
  const topNegative = entries.filter(([, v]) => v < 0).slice(0, 4);

  return (
    <div>
      {!hasData ? (
        <div className="taste-empty">
          <div className="taste-empty-icon">🎯</div>
          <p>Your taste profile builds automatically as you give feedback on recommendations.</p>
          <p style={{ marginTop: 8 }}>Head to Discover, search a vibe, and rate what you find.</p>
        </div>
      ) : (
        <div className="taste-grid">
          {/* Radar chart */}
          <div className="taste-radar-wrap" style={{ minHeight: 280 }}>
            <div style={{ width: '100%' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.76rem', color: 'var(--text3)', marginBottom: 12, textAlign: 'center' }}>
                Genre Affinity Radar
              </p>
              {radarData.length >= 3 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="tag"
                      tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-ui)' }} />
                    <Radar name="Affinity" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.22} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.82rem', padding: '40px 0' }}>
                  Rate more items to see the radar chart
                </p>
              )}
            </div>
          </div>

          {/* Bar chart */}
          <div className="taste-bars">
            {topPositive.length > 0 && (
              <>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--game2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  You Love
                </p>
                {topPositive.map(([tag, val]) => (
                  <div key={tag} className="taste-bar-row">
                    <span className="taste-bar-label" title={tag}>{tag}</span>
                    <div className="taste-bar-track">
                      <div className="taste-bar-fill positive" style={{ width: `${Math.min(100, val * 100)}%` }} />
                    </div>
                    <span className="taste-bar-val">{Math.round(val * 100)}%</span>
                  </div>
                ))}
              </>
            )}

            {topNegative.length > 0 && (
              <>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--film2)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 12px' }}>
                  Not Your Vibe
                </p>
                {topNegative.map(([tag, val]) => (
                  <div key={tag} className="taste-bar-row">
                    <span className="taste-bar-label" title={tag}>{tag}</span>
                    <div className="taste-bar-track">
                      <div className="taste-bar-fill negative" style={{ width: `${Math.min(100, Math.abs(val) * 100)}%` }} />
                    </div>
                    <span className="taste-bar-val" style={{ color: 'var(--film2)' }}>{Math.round(Math.abs(val) * 100)}%</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
