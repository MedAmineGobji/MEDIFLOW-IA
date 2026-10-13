const { eq } = require('drizzle-orm');
const { jobOffers } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins } = require('../utils/notificationUtils');

const getAllJobOffers = async (req, res) => {
  try {
    const allOffers = await db.select().from(jobOffers).orderBy(jobOffers.createdAt);
    res.json(allOffers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getJobOfferById = async (req, res) => {
  const { id } = req.params;
  try {
    const offer = await db.select().from(jobOffers).where(eq(jobOffers.id, parseInt(id))).limit(1);
    if (offer.length === 0) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }
    res.json(offer[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createJobOffer = async (req, res) => {
  const { title, department, location, contractType, description, requirements, status } = req.body;
  try {
    console.log('📝 Création d\'une nouvelle offre:', { title, department, location, contractType });
    
    if (!title || !department || !location || !contractType || !description || !requirements) {
      console.log('❌ Champs manquants');
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    const newOffer = await db.insert(jobOffers).values({
      title,
      department,
      location,
      contractType,
      description,
      requirements,
      status: status || 'active',
    }).returning();
    
    console.log('✅ Offre créée avec succès:', newOffer[0].id);
    
    // Notifier les admins
    await notifyAdmins({
      title: 'Nouvelle offre d\'emploi',
      message: `Nouvelle offre créée : ${title} (${department} - ${location})`,
      type: 'job_offer_created',
      relatedId: newOffer[0].id
    });
    
    res.status(201).json(newOffer[0]);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'offre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

const updateJobOffer = async (req, res) => {
  const { id } = req.params;
  const { title, department, location, contractType, description, requirements, status } = req.body;
  try {
    const updatedOffer = await db.update(jobOffers)
      .set({
        title,
        department,
        location,
        contractType,
        description,
        requirements,
        status,
        updatedAt: new Date(),
      })
      .where(eq(jobOffers.id, parseInt(id)))
      .returning();
    if (updatedOffer.length === 0) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }
    res.json(updatedOffer[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteJobOffer = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOffer = await db.delete(jobOffers).where(eq(jobOffers.id, parseInt(id))).returning();
    if (deletedOffer.length === 0) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }
    
    // Notifier les admins
    await notifyAdmins({
      title: 'Offre d\'emploi supprimée',
      message: `L'offre "${deletedOffer[0].title}" a été supprimée`,
      type: 'job_offer_deleted',
      relatedId: parseInt(id)
    });
    
    res.json({ message: 'Offre supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllJobOffers, getJobOfferById, createJobOffer, updateJobOffer, deleteJobOffer };
