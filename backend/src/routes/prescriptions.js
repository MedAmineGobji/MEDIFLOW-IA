const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionsByAppointment,
} = require('../controllers/prescriptionController');
const { authenticate } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.post('/', createPrescription); // Créer une ordonnance (médecin uniquement)
router.get('/', getAllPrescriptions); // Obtenir toutes les ordonnances (filtrées par rôle)
router.get('/:id', getPrescriptionById); // Obtenir une ordonnance par ID
router.get('/appointment/:appointmentId', getPrescriptionsByAppointment); // Ordonnances par rendez-vous

module.exports = router;
