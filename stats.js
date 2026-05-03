/* ============================================================
   stats.js — Live stats from data.mcbroken.com/stats.json
   LOCATIONS and STATE_DATA are already loaded as globals
   from locations_data.js and state_data.js

   Accessibility:
   - Color is never the sole indicator (icons + labels supplement color)
   - Colorblind-safe palette: blue (neutral), orange (bad), teal (good)
   - WCAG AA contrast ratios met on dark background
   - Screen reader: aria-label on each card, live region for global %
   ============================================================ */
const STATS_URL = 'https://data.mcbroken.com/stats.json';

// US-only filter — excludes UK, Germany, and any other non-US locations in the dataset
const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL',
  'IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE',
  'NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD',
  'TN','TX','UT','VT','VA','WA','WV','WI','WY','PR'
]);

const US_LOCATIONS = LOCATIONS.filter(l => US_STATES.has(l.state));

document.addEventListener('DOMContentLoaded', async () => {
  buildStatCardsFromLocal();

  try {
    const res = await fetch(STATS_URL);
    const statsData = await res.json();

    const globalPct = document.getElementById('global-pct');
    globalPct.textContent = statsData.broken.toFixed(1) + '%';
    globalPct.setAttribute('aria-live', 'polite');
    globalPct.setAttribute('aria-label',
      `${statsData.broken.toFixed(1)} percent of machines currently broken`);

    document.getElementById('last-updated').textContent =
      'Live · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    buildCityTable(statsData.cities);
  } catch (err) {
    console.error('Failed to fetch live stats:', err);
    const brokenUS = US_LOCATIONS.filter(l => l.is_broken).length;
    const pct = (brokenUS / US_LOCATIONS.length * 100).toFixed(1);
    const globalPct = document.getElementById('global-pct');
    globalPct.textContent = pct + '%';
    globalPct.setAttribute('aria-label',
      `${pct} percent of machines currently broken (cached data)`);
    document.getElementById('last-updated').textContent = 'Cached data';
  }
});

function buildStatCardsFromLocal() {
  const total   = US_LOCATIONS.length;
  const broken  = US_LOCATIONS.filter(l => l.is_broken).length;
  const working = total - broken;

  const states = Object.entries(STATE_DATA).filter(([, d]) => d.total >= 10);
  const sorted = [...states].sort((a, b) => b[1].rate - a[1].rate);
  const worst  = sorted[0];
  const best   = sorted[sorted.length - 1];

  setCard(
    'sc-total',
    'Locations tracked',
    total.toLocaleString(),
    "U.S. McDonald's",
    'blue',
    '⬡',
    `${total.toLocaleString()} total U.S. McDonald's locations tracked`
  );
  setCard(
    'sc-broken',
    'Broken right now',
    broken.toLocaleString(),
    `${(broken / total * 100).toFixed(1)}% of all locations`,
    'orange',
    '✕',
    `${broken.toLocaleString()} machines broken right now, ${(broken / total * 100).toFixed(1)} percent of all locations`
  );
  setCard(
    'sc-working',
    'Working machines',
    working.toLocaleString(),
    `${(working / total * 100).toFixed(1)}% operational`,
    'teal',
    '✓',
    `${working.toLocaleString()} machines working, ${(working / total * 100).toFixed(1)} percent operational`
  );
  setCard(
    'sc-worst',
    'Worst state',
    worst[0],
    `${worst[1].rate}% broken (${worst[1].broken}/${worst[1].total})`,
    'orange',
    '▲',
    `Worst state: ${worst[0]}, ${worst[1].rate} percent broken, ${worst[1].broken} of ${worst[1].total} locations`
  );
  setCard(
    'sc-best',
    'Best state',
    best[0],
    `${best[1].rate}% broken (${best[1].broken}/${best[1].total})`,
    'teal',
    '▼',
    `Best state: ${best[0]}, ${best[1].rate} percent broken, ${best[1].broken} of ${best[1].total} locations`
  );
}

function setCard(id, label, value, sub, colorClass, icon, ariaLabel) {
  const el = document.getElementById(id);
  if (!el) return;

  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', ariaLabel);

  el.innerHTML = `
    <div class="sc-label" aria-hidden="true">${label}</div>
    <div class="sc-value ${colorClass}" aria-hidden="true">
      <span class="sc-icon">${icon}</span>${value}
    </div>
    <div class="sc-sub" aria-hidden="true">${sub}</div>
  `;
}

function buildCityTable(cities) {
  const top20 = [...cities]
    .sort((a, b) => b.broken - a.broken)
    .slice(0, 20);

  const tbody = document.getElementById('city-tbody');
  if (!tbody) return;

  tbody.innerHTML = top20.map((city, i) => {
    const brokenCount = Math.round(city.broken / 100 * city.total_locations);
    const pct         = city.broken.toFixed(1);
    const barWidth    = Math.min(100, city.broken);
    const rowLabel    = `Rank ${i + 1}: ${city.city}, ${brokenCount} broken out of ${city.total_locations} locations, ${pct} percent`;

    return `
      <tr aria-label="${rowLabel}">
        <td class="rank" aria-hidden="true">${i + 1}</td>
        <td class="city-name" aria-hidden="true">${city.city}</td>
        <td style="color:var(--orange);font-weight:500" aria-hidden="true">${brokenCount}</td>
        <td aria-hidden="true">${city.total_locations}</td>
        <td class="rate-bar-cell" aria-hidden="true">
          <div class="rate-bar-wrap" role="presentation">
            <div class="rate-bar-bg">
              <div class="rate-bar-fill" style="width:${barWidth}%"></div>
            </div>
            <span class="rate-pct">${pct}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}