/* ============================================================
   organizedata.js — Combines live API data with population
   Fetches from data.mcbroken.com/stats.json and builds
   chartData for the pictograph visualisation
   ============================================================ */
const STATS_URL_PICT = 'https://data.mcbroken.com/stats.json';

window.chartData = [];

async function loadChartData() {
  try {
    const res = await fetch(STATS_URL_PICT);
    const statsData = await res.json();

    // Build a lookup of broken rate by state from the API
    // The API returns per-city data; aggregate to state level
    const stateBreakdown = {};

    statsData.cities.forEach(city => {
      // City names are "City, ST" format
      const parts = city.city.split(', ');
      const stateCode = parts[parts.length - 1];

      if (!stateCode || stateCode.length !== 2) return;

      if (!stateBreakdown[stateCode]) {
        stateBreakdown[stateCode] = { total: 0, broken: 0 };
      }

      const total  = city.total_locations || 0;
      const broken = Math.round((city.broken / 100) * total);
      stateBreakdown[stateCode].total  += total;
      stateBreakdown[stateCode].broken += broken;
    });

    // Combine with STATE_DATA for more accurate broken counts
    // then join with population
    window.chartData = Object.entries(POPULATION_DATA)
      .map(([stateCode, population]) => {
        const sd = STATE_DATA[stateCode];
        if (!sd || sd.total === 0) return null;

        // brokenRate is the % of machines broken (0-100)
        const brokenRate = sd.rate / 100;

        // iceCreamDeficit = number of people who "can't get ice cream"
        // = population * brokenRate (people proportional to broken machines)
        const iceCreamDeficit = Math.round(population * brokenRate);

        return {
          state:          stateCode,
          population:     population,
          totalLocations: sd.total,
          brokenLocations: sd.broken,
          brokenRate:     sd.rate,
          iceCreamDeficit: iceCreamDeficit
        };
      })
      .filter(d => d !== null)
      .sort((a, b) => b.brokenRate - a.brokenRate); // default: worst first

    console.log('chartData ready:', window.chartData.length, 'states');

    // Trigger render now that data is ready
    if (typeof window.updateApp === 'function') {
      window.updateApp();
    }

  } catch (err) {
    console.error('Failed to load pictograph data:', err);

    // Fallback: build from STATE_DATA only (no live broken rate)
    window.chartData = Object.entries(POPULATION_DATA)
      .map(([stateCode, population]) => {
        const sd = STATE_DATA[stateCode];
        if (!sd || sd.total === 0) return null;
        const brokenRate    = sd.rate / 100;
        const iceCreamDeficit = Math.round(population * brokenRate);
        return {
          state:           stateCode,
          population:      population,
          totalLocations:  sd.total,
          brokenLocations: sd.broken,
          brokenRate:      sd.rate,
          iceCreamDeficit: iceCreamDeficit
        };
      })
      .filter(d => d !== null)
      .sort((a, b) => b.brokenRate - a.brokenRate);

    if (typeof window.updateApp === 'function') {
      window.updateApp();
    }
  }
}

// Kick off immediately — STATE_DATA must be loaded before this runs
loadChartData();