const express = require('express');
const { getAllJobOffers, getJobOfferById, createJobOffer, updateJobOffer, deleteJobOffer } = require('../controllers/jobOfferController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Lecture : tout utilisateur authentifié peut voir les offres
router.get('/', authenticate, getAllJobOffers);
router.get('/:id', authenticate, getJobOfferById);

// Création - hrRecruiter et admin
router.post('/', authenticate, authorize(['hrRecruiter', 'admin']), createJobOffer);

// Mise à jour - hrRecruiter et admin
router.put('/:id', authenticate, authorize(['hrRecruiter', 'admin']), updateJobOffer);

// Suppression - hrRecruiter et admin
router.delete('/:id', authenticate, authorize(['hrRecruiter', 'admin']), deleteJobOffer);

module.exports = router;
