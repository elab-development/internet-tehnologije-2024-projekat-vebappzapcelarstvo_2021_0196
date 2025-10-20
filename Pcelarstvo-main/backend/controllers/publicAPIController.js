const { getAirQuality } = require('../services/publicAPIServices/airQualityService');

const { getForecast } = require('../services/publicAPIServices/weatherService')


function toNumber(v) {
  if (v == null) return undefined;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

async function getAQ(req, res) {
  try {
    const lat = toNumber(req.query.lat);
    const lon = toNumber(req.query.lon);
    const days = req.query.days ? parseInt(req.query.days, 10) : 4;
    const timezone = req.query.tz || 'auto';

    if (lat == null || lon == null) {
      return res.status(400).json({ message: 'lat and lon are required (e.g. ?lat=44.8&lon=20.47)' });
    }

    const data = await getAirQuality({ lat, lon, forecast_days: days, timezone, includeAQI: true });
    res.set('Cache-Control', 'public, max-age=300');
    return res.json({ data });
  } catch (err) {
    console.error('getAirQuality error:', err);
    return res.status(500).json({ message: err.message || 'Failed to load air quality data.' });
  }
}

async function getForecastCNT(req, res) {
  try {
    const lat = toNumber(req.query.lat);
    const lon = toNumber(req.query.lon);
    const days = req.query.days ? parseInt(req.query.days, 10) : 7;
    const timezone = req.query.timezone || 'UTC';

    if (lat == null || lon == null) {
      return res.status(400).json({ message: 'lat and lon are required (e.g. ?lat=44.8&lon=20.47)' });
    }

    const data = await getForecast({ lat, lon, days, timezone });
    return res.json({ data });
  } catch (err) {
    console.error('getForecast error:', err);
    return res.status(500).json({ message: 'Failed to fetch forecast.' });
  }
}

module.exports = { getAQ, getForecastCNT };