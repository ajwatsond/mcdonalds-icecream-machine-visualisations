/* ============================================================
   stats.js — Live stats from data.mcbroken.com/stats.json
   LOCATIONS and STATE_DATA are already loaded as globals
   from locations_data.js and state_data.js
   ============================================================ */
const STATS_URL = 'https://data.mcbroken.com/stats.json';

document.addEventListener('DOMContentLoaded', async () => {
  // Stat cards can be built immediately from local data
  buildStatCardsFromLocal();

  try {
    // Fetch live stats for city table + global broken %
    const res = await fetch(STATS_URL);
    const statsData = await res.json();

    document.getElementById('global-pct').textContent =
      statsData.broken.toFixed(1) + '%';
    document.getElementById('last-updated').textContent =
      'Live · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    buildCityTable(statsData.cities);
  } catch (err) {
    console.error('Failed to fetch live stats:', err);
    // Fall back to computing from local LOCATIONS data
    const brokenUS = LOCATIONS.filter(l => l.is_broken).length;
    const pct = (brokenUS / LOCATIONS.length * 100).toFixed(1);
    document.getElementById('global-pct').textContent = pct + '%';
    document.getElementById('last-updated').textContent = 'Cached data';
  }
});

function buildStatCardsFromLocal() {
  const total   = LOCATIONS.length;
  const broken  = LOCATIONS.filter(l => l.is_broken).length;
  const working = total - broken;

  const states = Object.entries(STATE_DATA).filter(([, d]) => d.total >= 10);
  const sorted = [...states].sort((a, b) => b[1].rate - a[1].rate);
  const worst  = sorted[0];
  const best   = sorted[sorted.length - 1];

  setCard('sc-total',   'Locations tracked',  total.toLocaleString(),   "U.S. McDonald's", '');
  setCard('sc-broken',  'Broken right now',   broken.toLocaleString(),  `${(broken / total * 100).toFixed(1)}% of all locations`, 'red');
  setCard('sc-working', 'Working machines',   working.toLocaleString(), `${(working / total * 100).toFixed(1)}% operational`, 'green');
  setCard('sc-worst',   'Worst state',        worst[0], `${worst[1].rate}% broken (${worst[1].broken}/${worst[1].total})`, 'red');
  setCard('sc-best',    'Best state',         best[0],  `${best[1].rate}% broken (${best[1].broken}/${best[1].total})`, 'green');
}

function setCard(id, label, value, sub, colorClass) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `
    <div class="sc-label">${label}</div>
    <div class="sc-value ${colorClass}">${value}</div>
    <div class="sc-sub">${sub}</div>
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
    return `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="city-name">${city.city}</td>
        <td style="color:var(--red);font-weight:500">${brokenCount}</td>
        <td>${city.total_locations}</td>
        <td class="rate-bar-cell">
          <div class="rate-bar-wrap">
            <div class="rate-bar-bg">
              <div class="rate-bar-fill" style="width:${Math.min(100, city.broken)}%"></div>
            </div>
            <span class="rate-pct">${city.broken.toFixed(1)}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
