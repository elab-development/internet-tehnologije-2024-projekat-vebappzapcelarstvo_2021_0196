const {
  getCompletionsByMonth,
  getCommentsByBeekeeper
} = require('../services/statsService');

async function completionsByMonth(req, res) {
  try {
    const data = await getCompletionsByMonth();
    res.set('Cache-Control', 'public, max-age=120');
    return res.json({ data });
  } catch (err) {
    console.error('completions-by-month error:', err);
    return res.status(500).json({ message: 'Failed to load completions by month.' });
  }
}

async function commentsByBeekeeper(req, res) {
  try {
    const data = await getCommentsByBeekeeper();
    res.set('Cache-Control', 'public, max-age=120');
    return res.json({ data });
  } catch (err) {
    console.error('comments-by-beekeeper error:', err);
    return res.status(500).json({ message: 'Failed to load comments by beekeeper.' });
  }
}

module.exports = { completionsByMonth, commentsByBeekeeper };
