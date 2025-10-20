const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findUserByUsername } = require('../services/userService');
const { registerUser, changePassword } = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'tajni_kljuc_za_dev';

async function register(req, res) {
  try {
    const { username, password, name, surname } = req.body;

    if (!username || !password || !name || !surname) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await registerUser({ username, password, name, surname });

    return res.status(200).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required.' });
  }

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({ 
      token,
      username: user.username,
      role: user.role 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

async function changePasswordCNT(req, res) {
  try {
    const { username, oldPassword, newPassword } = req.body || {};
    const out = await changePassword({ username, oldPassword, newPassword });
    return res.json(out);
  } catch (e) {
    const code = e.statusCode || 500;
    console.error('changePassword error:', e);
    return res.status(code).json({ message: e.message || 'Failed to change password.' });
  }
}

module.exports = { register, login, changePasswordCNT };
