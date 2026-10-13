const express = require('express');
const { login, me, signup, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;