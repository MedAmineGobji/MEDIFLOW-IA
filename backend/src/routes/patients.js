const express = require('express');
const { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient, getPatientStats, getPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Statistiques pour le patient connecté - DOIT ÊTRE AVANT /:id
router.get('/stats/dashboard', authenticate, authorize(['patient']), getPatientStats);

// Profile du patient connecté - DOIT ÊTRE AVANT /:id
router.get('/profile', authenticate, authorize(['patient']), getPatientProfile);
router.put('/profile', authenticate, authorize(['patient']), updatePatientProfile);

// Routes protégées - admin et doctor peuvent voir tous les patients
router.get('/', authenticate, authorize(['admin', 'doctor']), getAllPatients);
router.get('/:id', authenticate, authorize(['admin', 'doctor']), getPatientById);

// Création - admin et doctor
router.post('/', authenticate, authorize(['admin', 'doctor']), createPatient);

// Mise à jour - admin et doctor
router.put('/:id', authenticate, authorize(['admin', 'doctor']), updatePatient);

// Suppression - admin et doctor
router.delete('/:id', authenticate, authorize(['admin', 'doctor']), deletePatient);

module.exports = router;