const express = require('express');
const { getAllMedicalRecords, getMedicalRecordById, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes protégées - admin, doctor et patient peuvent voir les dossiers médicaux
// Le contrôleur filtre automatiquement selon le rôle
router.get('/', authenticate, authorize(['admin', 'doctor', 'patient']), getAllMedicalRecords);
router.get('/:id', authenticate, authorize(['admin', 'doctor', 'patient']), getMedicalRecordById);

// Création - admin et doctor peuvent créer
router.post('/', authenticate, authorize(['admin', 'doctor']), createMedicalRecord);

// Mise à jour - admin et doctor peuvent modifier
router.put('/:id', authenticate, authorize(['admin', 'doctor']), updateMedicalRecord);

// Suppression - admin seulement
router.delete('/:id', authenticate, authorize(['admin']), deleteMedicalRecord);

module.exports = router;