/* ============================================================
   McBroken — Visualization Site
   Aesthetic: Editorial data journalism. Bold. Functional. 
   Red x black x off-white. Bebas Neue for impact.
   ============================================================ */

:root {
  --red:        #e8191e;
  --red-dark:   #9e0b0f;
  --red-pale:   #fff0f0;
  --yellow:     #ffcb05;
  --black:      #111111;
  --ink:        #1a1a1a;
  --mid:        #555;
  --muted:      #999;
  --border:     #e0dbd4;
  --paper:      #faf8f5;
  --white:      #ffffff;

  --working-color: #22c55e;
  --broken-color:  #e8191e;

  --font-display: 'Bebas Neue', sans-serif;
  --font-mono:    'DM Mono', monospace;
  --font-body:    'DM Sans', sans-serif;

  --shadow: 0 2px 16px rgba(0,0,0,0.08);
  --shadow-heavy: 0 8px 40px rgba(0,0,0,0.16);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
}

a { color: var(--red); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ── HEADER ──────────────────────────────────── */
header {
  background: var(--black);
  color: var(--white);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 3px solid var(--red);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon { font-size: 22px; }
.logo-text {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 0.04em;
  color: var(--yellow);
}

.header-stat {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}
.stat-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.stat-value {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--red);
  letter-spacing: 0.04em;
}

.header-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}

/* ── HERO ────────────────────────────────────── */
.hero {
  background: var(--black);
  padding: 48px 24px 56px;
}
.hero-inner { max-width: 1400px; margin: 0 auto; }

.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 72px);
  line-height: 1.0;
  color: var(--white);
  letter-spacing: 0.02em;
  margin-bottom: 16px;
}
.hero h1 em {
  color: var(--red);
  font-style: normal;
}
.hero-sub {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--muted);
}
.hero-sub a { color: var(--yellow); }

/* ── CONTROLS BAR ────────────────────────────── */
.controls-bar {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 56px;
  z-index: 90;
}
.controls-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.toggle-group {
  display: flex;
  background: #f0ece6;
  border-radius: 6px;
  padding: 3px;
  gap: 2px;
}
.toggle-btn {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  padding: 6px 16px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--mid);
  transition: all 0.15s;
}
.toggle-btn.active {
  background: var(--black);
  color: var(--white);
}
.toggle-btn:hover:not(.active) { background: #e0dbd4; }

.zoom-hint {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── MAP SECTION ─────────────────────────────── */
.map-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 24px;
  align-items: start;
}

.map-wrapper {
  position: relative;
  background: #e8f4fc;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

#choropleth {
  display: block;
  width: 100%;
  height: auto;
  cursor: pointer;
}

#dot-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
#dot-canvas.visible { opacity: 1; }

/* State zoom overlay */
.zoomed-label {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(17,17,17,0.85);
  color: var(--white);
  padding: 8px 14px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  backdrop-filter: blur(4px);
}
.zoomed-label.hidden { display: none; }

.back-btn {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--red);
  color: var(--white);
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.back-btn:hover { background: var(--red-dark); }

/* Tooltip */
.tooltip {
  position: absolute;
  background: var(--black);
  color: var(--white);
  padding: 10px 14px;
  border-radius: 6px;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  box-shadow: var(--shadow-heavy);
  max-width: 220px;
  z-index: 50;
  transition: opacity 0.1s;
  border-left: 3px solid var(--red);
}
.tooltip.hidden { opacity: 0; }
.tooltip strong {
  display: block;
  font-size: 13px;
  color: var(--yellow);
  margin-bottom: 4px;
}
.tooltip .tt-broken { color: var(--red); }
.tooltip .tt-working { color: var(--working-color); }

/* ── LEGEND ──────────────────────────────────── */
.legend-panel {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow);
}

.legend-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--mid);
  margin-bottom: 12px;
}

.legend-gradient {
  height: 120px;
  width: 24px;
  border-radius: 3px;
  margin: 0 auto 8px;
}

.legend-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--mid);
  height: 120px;
  margin-bottom: 16px;
}

.legend-dots-key { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 14px; }
.dot-key {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--mid);
  margin-bottom: 6px;
}
.dot-sample {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-sample.working { background: var(--working-color); }
.dot-sample.broken  { background: var(--broken-color); }

/* ── STATS STRIP ─────────────────────────────── */
.stats-strip {
  background: var(--black);
  border-top: 1px solid #222;
  border-bottom: 1px solid #222;
}
.stats-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  divide: solid;
}

.stat-card {
  padding: 28px 20px;
  border-right: 1px solid #2a2a2a;
  text-align: center;
}
.stat-card:last-child { border-right: none; }

.stat-card .sc-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #666;
  margin-bottom: 6px;
}
.stat-card .sc-value {
  font-family: var(--font-display);
  font-size: 36px;
  color: var(--white);
  letter-spacing: 0.04em;
  line-height: 1;
}
.stat-card .sc-sub {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #555;
  margin-top: 4px;
}
.stat-card .sc-value.red { color: var(--red); }
.stat-card .sc-value.green { color: var(--working-color); }

/* ── CITY TABLE ──────────────────────────────── */
.city-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}
.city-section h2 {
  font-family: var(--font-display);
  font-size: 36px;
  letter-spacing: 0.04em;
  margin-bottom: 24px;
  color: var(--ink);
}

.city-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 13px;
}
.city-table th {
  text-align: left;
  padding: 10px 16px;
  border-bottom: 2px solid var(--black);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--mid);
}
.city-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.city-table tr:hover td { background: var(--red-pale); }
.city-table .rank { color: var(--muted); font-size: 11px; }
.city-table .city-name { font-weight: 500; color: var(--ink); font-family: var(--font-body); }

.rate-bar-cell { min-width: 180px; }
.rate-bar-wrap { display: flex; align-items: center; gap: 10px; }
.rate-bar-bg {
  flex: 1;
  height: 6px;
  background: #ece8e2;
  border-radius: 3px;
  overflow: hidden;
}
.rate-bar-fill {
  height: 100%;
  background: var(--red);
  border-radius: 3px;
  transition: width 0.4s;
}
.rate-pct {
  font-weight: 500;
  color: var(--red);
  min-width: 36px;
  text-align: right;
}

/* ── FOOTER ──────────────────────────────────── */
footer {
  background: var(--black);
  border-top: 3px solid var(--red);
  padding: 32px 24px;
}
.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #555;
  line-height: 1.8;
}
.footer-inner a { color: #888; }
.footer-note { color: #3a3a3a; margin-top: 4px; }

/* ── UTILITY ─────────────────────────────────── */
.hidden { display: none !important; }

/* State paths */
.state-path {
  stroke: var(--white);
  stroke-width: 0.5;
  cursor: pointer;
  transition: opacity 0.15s;
}
.state-path:hover { opacity: 0.8; stroke-width: 1.5; }
.state-path.selected { stroke: var(--yellow); stroke-width: 2; }

/* Responsive */
@media (max-width: 900px) {
  .map-section { grid-template-columns: 1fr; }
  .legend-panel { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
  .legend-gradient { height: 24px; width: 160px; }
  .legend-labels { flex-direction: row; height: auto; }
  .stats-inner { grid-template-columns: repeat(3, 1fr); }
  .stat-card:nth-child(3) { border-right: none; }
}
@media (max-width: 600px) {
  .stats-inner { grid-template-columns: 1fr 1fr; }
  .header-meta { display: none; }
}
