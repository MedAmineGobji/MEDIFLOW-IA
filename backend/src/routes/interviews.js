const express = require('express');
const { authenticate } = require('../middleware/auth');
const { scheduleInterview, getInterviewsByApplication, getAllInterviews, updateInterviewStatus, deleteInterview, respondToInterview } = require('../controllers/interviewController');

const router = express.Router();

// Planifier un entretien
router.post('/', authenticate, scheduleInterview);
router.post('/schedule', authenticate, scheduleInterview);

// Récupérer les entretiens d'une candidature
router.get('/application/:applicationId', authenticate, getInterviewsByApplication);

// Récupérer tous les entretiens (pour les RH)
router.get('/', authenticate, getAllInterviews);

// Mettre à jour le statut d'un entretien
router.patch('/:id/status', authenticate, updateInterviewStatus);

// Supprimer un entretien
router.delete('/:id', authenticate, deleteInterview);

// Répondre à un entretien (candidats)
router.patch('/:id/respond', authenticate, respondToInterview);

module.exports = router;