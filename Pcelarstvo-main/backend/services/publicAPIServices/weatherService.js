const BASE = 'https://api.open-meteo.com/v1/forecast';

async function getForecast({ lat, lon, days = 7, timezone = 'UTC' } = {}) {
  if (lat == null || lon == null) {
    throw new Error('lat and lon are required');
  }

  const url =
    `${BASE}?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&forecast_days=${days}&timezone=${encodeURIComponent(timezone)}`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`weather http ${r.status}`);
  const j = await r.json();

  const daily = j.daily || {};
  const out = (daily.time || []).map((date, i) => ({
    date,
    tmax: daily.temperature_2m_max?.[i] ?? null,
    tmin: daily.temperature_2m_min?.[i] ?? null,
    precip: daily.precipitation_sum?.[i] ?? null
  }));

  return { provider: 'open-meteo', location: { lat, lon }, days: out.length, data: out };
}

module.exports = { getForecast };
