const AQ_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function buildParams(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) p.set(k, String(v));
  }
  return p.toString();
}

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`${url} -> HTTP ${r.status} ${body}`);
  }
  return r.json();
}

async function getAirQuality({ lat, lon, forecast_days = 4, timezone = 'auto', includeAQI = true } = {}) {
  if (lat == null || lon == null) throw new Error('lat and lon are required');

  const vars = [
    'pm2_5',
    'pm10',
    'ozone',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'carbon_monoxide',
  ];
  if (includeAQI) {
    vars.push('european_aqi', 'us_aqi');
  }

  const url = `${AQ_BASE}?` + buildParams({
    latitude: lat,
    longitude: lon,
    forecast_days,
    timezone,
    hourly: vars.join(',')
  });

  const data = await fetchJson(url);

  const hours = [];
  const h = data.hourly || {};
  const times = h.time || [];
  times.forEach((t, i) => {
    const row = { time: t };
    for (const [k, arr] of Object.entries(h)) {
      if (k === 'time') continue;
      row[k] = Array.isArray(arr) ? arr[i] : null;
    }
    hours.push(row);
  });

  return { provider: 'open-meteo', location: { lat, lon }, hours };
}

module.exports = { getAirQuality };
