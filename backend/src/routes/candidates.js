const express = require('express');
const { getAllCandidates, getCandidateById, getCandidateStats } = require('../controllers/candidateController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes pour les candidats - accessibles aux RH et admins
router.get('/', authenticate, authorize(['hrRecruiter', 'admin']), getAllCandidates);
router.get('/:id', authenticate, authorize(['hrRecruiter', 'admin']), getCandidateById);

// Statistiques pour le candidat connecté
router.get('/stats/dashboard', authenticate, authorize(['candidate']), getCandidateStats);

module.exports = router;