const express = require('express');
const { getHRStats } = require('../controllers/hrController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Statistiques pour les RH
router.get('/stats/dashboard', authenticate, authorize(['hrRecruiter', 'admin']), getHRStats);

module.exports = router;