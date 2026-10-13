const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createJobApplication, getApplicationsForCandidate, getAllApplications, updateApplicationStatus } = require('../controllers/jobApplicationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Configuration de l'upload de fichiers (CV)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../../uploads/cv');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

// Candidat : voir ses candidatures et en créer
router.get('/', authenticate, authorize(['candidate']), getApplicationsForCandidate);
router.post('/', authenticate, authorize(['candidate']), upload.single('cv'), createJobApplication);

// RH : voir toutes les candidatures et mettre à jour leur statut
router.get('/all', authenticate, authorize(['hrRecruiter']), getAllApplications);
router.patch('/:id/status', authenticate, authorize(['hrRecruiter', 'admin']), updateApplicationStatus);

module.exports = router;

