const express = require('express');
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  acceptAppointment,
  rejectAppointment,
  proposeNewDate,
  acceptProposedDate,
  proposeCounterDate
} = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes protégées - tous les rôles peuvent voir leurs rendez-vous
router.get('/', authenticate, getAllAppointments);
router.get('/:id', authenticate, getAppointmentById);

// Création - patients, doctors et admins peuvent créer
router.post('/', authenticate, authorize(['patient', 'doctor', 'admin']), createAppointment);

// Mise à jour - doctors et admins peuvent modifier leurs rendez-vous
router.put('/:id', authenticate, authorize(['doctor', 'admin']), updateAppointment);

// Accepter un rendez-vous - médecins uniquement
router.patch('/:id/accept', authenticate, authorize(['doctor']), acceptAppointment);

// Refuser un rendez-vous - médecins uniquement
router.patch('/:id/reject', authenticate, authorize(['doctor']), rejectAppointment);

// Proposer une nouvelle date - médecins uniquement
router.patch('/:id/propose-date', authenticate, authorize(['doctor']), proposeNewDate);

// Accepter la date proposée - patients et médecins
router.patch('/:id/accept-proposed-date', authenticate, authorize(['patient', 'doctor']), acceptProposedDate);

// Proposer une contre-date - patients uniquement
router.patch('/:id/counter-propose-date', authenticate, authorize(['patient']), proposeCounterDate);

// Suppression - admin seulement
router.delete('/:id', authenticate, authorize(['admin']), deleteAppointment);

module.exports = router;