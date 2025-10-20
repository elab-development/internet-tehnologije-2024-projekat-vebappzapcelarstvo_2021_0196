const { listBeekeepers } = require('../services/userService');

async function getBeekeepers(req, res) {
  try {
    const rows = await listBeekeepers();
    return res.json({ items: rows });
  } catch (e) {
    console.error('getBeekeepers error:', e);
    return res.status(500).json({ message: 'Failed to load users.' });
  }
}

module.exports = { getBeekeepers }