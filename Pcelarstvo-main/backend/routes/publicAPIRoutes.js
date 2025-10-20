const express = require('express');
const { getAQ , getForecastCNT } = require('../controllers/publicAPIController');
const { requireAuth, requireRole } = require('../services/middleware')
const router = express.Router();

router.use(requireAuth, requireRole('administrator'));

router.get('/getAirQuality', getAQ);
router.get('/getForecast', getForecastCNT);

module.exports = router;
