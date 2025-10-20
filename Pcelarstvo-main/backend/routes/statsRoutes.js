const express = require('express');
const { completionsByMonth, commentsByBeekeeper } = require('../controllers/statsController');

const router = express.Router();

router.get('/completions-by-month', completionsByMonth);
router.get('/comments-by-beekeeper', commentsByBeekeeper);

module.exports = router;
