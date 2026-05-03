/* ============================================================
   map.js — McBroken Choropleth + Dot Drill-down
   Uses D3 v7 + TopoJSON
   ============================================================ */

// ── CONFIG ──────────────────────────────────────────────────
const MAP_W = 960;
const MAP_H = 580;
const DOT_ZOOM_THRESHOLD = 3;
const ZOOM_DURATION = 750;

let currentMode = 'rate';
let zoomedState = null;
let currentTransform = d3.zoomIdentity;

// Colorblind-safe dot colors (match CSS --orange / --teal)
const COLOR_BROKEN  = 'rgba(224,112,0,0.85)';   // --orange
const COLOR_WORKING = 'rgba(0,166,147,0.75)';    // --teal

// Color scales
// Rate scale: light orange-pale → orange → dark orange-red
const rateScale = d3.scaleSequential()
  .domain([0, 50])
  .interpolator(d3.interpolateRgbBasis(['#fff4e6', '#fdba74', '#E07000', '#7c3400']));

// Total scale: unchanged (blue — already colorblind safe)
const totalScale = d3.scaleSequential()
  .domain([0, 1300])
  .interpolator(d3.interpolateRgbBasis(['#eff6ff', '#93c5fd', '#3b82f6', '#1e3a8a']));

// ── SETUP ────────────────────────────────────────────────────
const svg = d3.select('#choropleth')
  .attr('viewBox', `0 0 ${MAP_W} ${MAP_H}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');

const mapGroup = svg.append('g').attr('id', 'map-group');
const stateGroup = mapGroup.append('g').attr('id', 'states');

const tooltip = document.getElementById('tooltip');
const dotCanvas = document.getElementById('dot-canvas');
const ctx = dotCanvas.getContext('2d');

const projection = d3.geoAlbersUsa()
  .scale(1280)
  .translate([MAP_W / 2, MAP_H / 2]);

const path = d3.geoPath().projection(projection);

// ── ZOOM ─────────────────────────────────────────────────────
const zoom = d3.zoom()
  .scaleExtent([1, 12])
  .on('zoom', (event) => {
    currentTransform = event.transform;
    mapGroup.attr('transform', currentTransform);
    syncCanvas();
    updateDotVisibility();
  });

svg.call(zoom);

// ── LOAD TOPOJSON ─────────────────────────────────────────────
d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(us => {
  const states = topojson.feature(us, us.objects.states);
  const stateNames = {
    '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
    '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
    '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
    '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
    '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
    '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
    '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
    '55':'WI','56':'WY','72':'PR','78':'VI'
  };

  const stateFullNames = {
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
    CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'Dist. of Columbia',
    FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',
    IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',
    ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',
    MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',
    NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',
    NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',
    PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
    TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',
    WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
    PR:'Puerto Rico'
  };

  // Draw states
  stateGroup.selectAll('path')
    .data(states.features)
    .join('path')
    .attr('class', 'state-path')
    .attr('d', path)
    .attr('data-abbr', d => stateNames[d.id] || '')
    .attr('fill', d => {
      const abbr = stateNames[d.id];
      return getFill(abbr, currentMode);
    })
    .on('mouseenter', function(event, d) {
      const abbr = stateNames[d.id];
      const sd = STATE_DATA[abbr];
      if (!sd) return;
      const name = stateFullNames[abbr] || abbr;
      tooltip.innerHTML = `
        <strong>${name} (${abbr})</strong>
        <span class="tt-broken">⚠ Broken: ${sd.broken} (${sd.rate}%)</span>
        <span class="tt-working">✓ Working: ${sd.total - sd.broken}</span>
        <span>Total locations: ${sd.total}</span>
      `;
      tooltip.classList.remove('hidden');
      positionTooltip(event);
    })
    .on('mousemove', positionTooltip)
    .on('mouseleave', () => tooltip.classList.add('hidden'))
    .on('click', function(event, d) {
      const abbr = stateNames[d.id];
      if (!abbr || !STATE_DATA[abbr]) return;
      const name = stateFullNames[abbr] || abbr;
      zoomToState(d, abbr, name, this);
      event.stopPropagation();
    });

  // Click backdrop to reset
  svg.on('click', () => {
    if (zoomedState) resetZoom();
  });

  // Draw state borders
  mapGroup.append('path')
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255,255,255,0.6)')
    .attr('stroke-width', 0.5)
    .attr('pointer-events', 'none');

  syncCanvasSize();
  window.addEventListener('resize', () => { syncCanvasSize(); drawDots(); });

  buildLegend(currentMode);

  const total  = Object.values(STATE_DATA).reduce((s, d) => s + d.total, 0);
  const broken = Object.values(STATE_DATA).reduce((s, d) => s + d.broken, 0);
  document.getElementById('global-pct').textContent = (broken / total * 100).toFixed(1) + '%';
  document.getElementById('last-updated').textContent =
    'Live · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

// ── ZOOM TO STATE ─────────────────────────────────────────────
function zoomToState(feature, abbr, name, el) {
  d3.selectAll('.state-path').classed('selected', false);
  d3.select(el).classed('selected', true);

  zoomedState = abbr;

  const [[x0, y0], [x1, y1]] = path.bounds(feature);
  const scale = Math.min(8, 0.9 / Math.max((x1 - x0) / MAP_W, (y1 - y0) / MAP_H));
  const tx = MAP_W / 2 - scale * (x0 + x1) / 2;
  const ty = MAP_H / 2 - scale * (y0 + y1) / 2;

  svg.transition().duration(ZOOM_DURATION)
    .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));

  document.getElementById('zoomed-label').classList.remove('hidden');
  document.getElementById('zoomed-state-name').textContent =
    `${name} — ${STATE_DATA[abbr]?.broken || 0} broken / ${STATE_DATA[abbr]?.total || 0} total`;
  document.getElementById('legend-dots').classList.remove('hidden');
  document.getElementById('zoom-hint').innerHTML =
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3l9 9-9 9"/></svg> Click anywhere on the map to reset`;
}

// ── RESET ZOOM ────────────────────────────────────────────────
function resetZoom() {
  zoomedState = null;
  d3.selectAll('.state-path').classed('selected', false);

  svg.transition().duration(ZOOM_DURATION)
    .call(zoom.transform, d3.zoomIdentity);

  document.getElementById('zoomed-label').classList.add('hidden');
  document.getElementById('legend-dots').classList.add('hidden');
  document.getElementById('zoom-hint').innerHTML =
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg> Click a state to zoom in and see individual locations`;

  setTimeout(() => {
    ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
    dotCanvas.classList.remove('visible');
  }, ZOOM_DURATION);
}

// ── DOT DRAWING ───────────────────────────────────────────────
function updateDotVisibility() {
  const scale = currentTransform.k;
  if (scale >= DOT_ZOOM_THRESHOLD) {
    drawDots();
    dotCanvas.classList.add('visible');
  } else {
    dotCanvas.classList.remove('visible');
    ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
  }
}

function drawDots() {
  const k = currentTransform.k;
  if (k < DOT_ZOOM_THRESHOLD) return;

  const svgEl = document.getElementById('choropleth');
  const rect = svgEl.getBoundingClientRect();
  const cssW = rect.width;
  const cssH = rect.height;
  const svgScaleX = cssW / MAP_W;
  const svgScaleY = cssH / MAP_H;

  ctx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);

  const dotR = Math.max(2, Math.min(6, k * 1.2));

  const locs = zoomedState
    ? LOCATIONS.filter(l => l.state === zoomedState)
    : LOCATIONS;

  for (const loc of locs) {
    const proj = projection([loc.lon, loc.lat]);
    if (!proj) continue;
    const [sx, sy] = proj;

    const px = currentTransform.x * svgScaleX + sx * k * svgScaleX;
    const py = currentTransform.y * svgScaleY + sy * k * svgScaleY;

    if (px < -dotR || px > cssW + dotR || py < -dotR || py > cssH + dotR) continue;

    ctx.beginPath();
    ctx.arc(px, py, dotR, 0, Math.PI * 2);
    // Use colorblind-safe orange/teal instead of red/green
    ctx.fillStyle = loc.is_broken ? COLOR_BROKEN : COLOR_WORKING;
    ctx.fill();

    if (dotR > 3) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }
}

// ── CANVAS SYNC ───────────────────────────────────────────────
function syncCanvasSize() {
  const svgEl = document.getElementById('choropleth');
  const rect = svgEl.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  dotCanvas.width  = rect.width * dpr;
  dotCanvas.height = rect.height * dpr;
  dotCanvas.style.width  = rect.width + 'px';
  dotCanvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function syncCanvas() {
  const svgEl = document.getElementById('choropleth');
  const rect = svgEl.getBoundingClientRect();
  if (Math.abs(dotCanvas.offsetWidth - rect.width) > 2) syncCanvasSize();
}

// ── TOOLTIP POSITIONING ───────────────────────────────────────
function positionTooltip(event) {
  const svgEl = document.getElementById('choropleth');
  const rect = svgEl.getBoundingClientRect();
  let x = event.clientX - rect.left + 12;
  let y = event.clientY - rect.top - 10;
  if (x + 230 > rect.width) x = event.clientX - rect.left - 230;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
  tooltip.classList.remove('hidden');
}

// ── MODE SWITCH ───────────────────────────────────────────────
function switchMode(mode) {
  currentMode = mode;

  document.getElementById('btn-rate').classList.toggle('active', mode === 'rate');
  document.getElementById('btn-total').classList.toggle('active', mode === 'total');

  d3.selectAll('.state-path')
    .transition().duration(300)
    .attr('fill', function() {
      const abbr = this.getAttribute('data-abbr');
      return getFill(abbr, mode);
    });

  buildLegend(mode);
}

function getFill(abbr, mode) {
  const sd = STATE_DATA[abbr];
  if (!sd || sd.total === 0) return '#d1cdc7';
  if (mode === 'rate') return rateScale(sd.rate);
  return totalScale(sd.total);
}

// ── LEGEND ───────────────────────────────────────────────────
function buildLegend(mode) {
  const grad  = document.getElementById('legend-gradient');
  const minEl = document.getElementById('legend-min');
  const maxEl = document.getElementById('legend-max');
  document.getElementById('legend-title').textContent =
    mode === 'rate' ? 'Broken Rate (%)' : 'Total Locations';

  if (mode === 'rate') {
    // Orange scale matches colorblind-safe palette
    grad.style.background = 'linear-gradient(to top, #7c3400, #E07000, #fdba74, #fff4e6)';
    maxEl.textContent = '50%+';
    minEl.textContent = '0%';
  } else {
    grad.style.background = 'linear-gradient(to top, #1e3a8a, #3b82f6, #93c5fd, #eff6ff)';
    maxEl.textContent = '1,300+';
    minEl.textContent = '0';
  }
}