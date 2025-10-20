const express = require('express');
const { register, login, changePasswordCNT } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/changePW', changePasswordCNT);

module.exports = router;
