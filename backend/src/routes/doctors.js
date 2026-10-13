const express = require('express');
const { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, getDoctorStats } = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Statistiques du médecin - médecins seulement (DOIT être avant /:id)
router.get('/stats/dashboard', authenticate, authorize(['doctor']), getDoctorStats);

// Routes protégées - patients et admin peuvent voir les médecins
router.get('/', authenticate, authorize(['admin', 'patient']), getAllDoctors);
router.get('/:id', authenticate, authorize(['admin', 'patient']), getDoctorById);

// Création - admin seulement
router.post('/', authenticate, authorize(['admin']), createDoctor);

// Mise à jour - admin seulement
router.put('/:id', authenticate, authorize(['admin']), updateDoctor);

// Suppression - admin seulement
router.delete('/:id', authenticate, authorize(['admin']), deleteDoctor);

module.exports = router;