const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { analyzeCV, analyzeExistingCV, compareCVs, validateCV, getAllAnalyses, getAnalysisStats } = require('../controllers/cvAnalysisController');

// Configuration de multer pour l'upload des CV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/cv'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez PDF ou TXT.'), false);
    }
  }
});

// Routes pour l'analyse des CV
router.post('/analyze', authenticate, upload.single('cv'), analyzeCV);
router.post('/analyze-existing', authenticate, analyzeExistingCV);

router.post('/compare', authenticate, compareCVs);
router.post('/validate', upload.single('cv'), validateCV);
router.get('/all', authenticate, getAllAnalyses);
router.get('/stats', authenticate, getAnalysisStats);

router.get('/stats', authenticate, async function(req, res) {
  try {
    // Statistiques d'analyse (à implémenter)
    res.json({
      success: true,
      data: {
        totalAnalyses: 0,
        averageScore: 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// Route pour récupérer les analyses des candidatures
router.get('/analyses', authenticate, getAllAnalyses);

module.exports = router;