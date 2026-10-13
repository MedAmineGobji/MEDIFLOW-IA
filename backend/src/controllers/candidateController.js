const { eq, and, gte, lte, count, sql } = require('drizzle-orm');
const { candidates, users, jobApplications, interviews, jobOffers } = require('../../../database/schema');
const db = require('../config/database');

const getAllCandidates = async (req, res) => {
  try {
    const candidatesList = await db.select({
      id: candidates.id,
      firstName: candidates.firstName,
      lastName: candidates.lastName,
      email: candidates.email,
      phone: candidates.phone,
      skills: candidates.skills,
      experience: candidates.experience,
      status: candidates.status,
      aiAnalysis: candidates.aiAnalysis,
      createdAt: candidates.createdAt,
      updatedAt: candidates.updatedAt,
      userId: users.id
    })
    .from(candidates)
    .leftJoin(users, eq(candidates.id, users.id))
    .orderBy(candidates.createdAt);

    res.json(candidatesList);
  } catch (error) {
    console.error('Erreur dans getAllCandidates:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

const getCandidateById = async (req, res) => {
  const { id } = req.params;

  try {
    const candidate = await db.select({
      id: candidates.id,
      firstName: candidates.firstName,
      lastName: candidates.lastName,
      email: candidates.email,
      phone: candidates.phone,
      skills: candidates.skills,
      experience: candidates.experience,
      status: candidates.status,
      aiAnalysis: candidates.aiAnalysis,
      createdAt: candidates.createdAt,
      updatedAt: candidates.updatedAt,
      userId: users.id
    })
    .from(candidates)
    .leftJoin(users, eq(candidates.id, users.id))
    .where(eq(candidates.id, Number(id)))
    .limit(1);

    if (candidate.length === 0) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }

    res.json(candidate[0]);
  } catch (error) {
    console.error('Erreur dans getCandidateById:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

const getCandidateStats = async (req, res) => {
  try {
    const candidateId = req.user.sub;
    const today = new Date();

    // Candidatures totales
    const totalApplicationsResult = await db.select({ count: count() })
      .from(jobApplications)
      .where(eq(jobApplications.candidateUserId, candidateId));

    // Candidatures acceptées
    const acceptedApplicationsResult = await db.select({ count: count() })
      .from(jobApplications)
      .where(and(
        eq(jobApplications.candidateUserId, candidateId),
        eq(jobApplications.status, 'accepté')
      ));

    // Candidatures rejetées
    const rejectedApplicationsResult = await db.select({ count: count() })
      .from(jobApplications)
      .where(and(
        eq(jobApplications.candidateUserId, candidateId),
        eq(jobApplications.status, 'rejeté')
      ));

    // Candidatures en attente
    const pendingApplicationsResult = await db.select({ count: count() })
      .from(jobApplications)
      .where(and(
        eq(jobApplications.candidateUserId, candidateId),
        eq(jobApplications.status, 'en attente')
      ));

    // Entretiens totaux
    const totalInterviewsResult = await db.select({ count: count() })
      .from(interviews)
      .innerJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .where(eq(jobApplications.candidateUserId, candidateId));

    // Entretiens passés
    const pastInterviewsResult = await db.select({ count: count() })
      .from(interviews)
      .innerJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .where(and(
        eq(jobApplications.candidateUserId, candidateId),
        lte(interviews.interviewDate, today)
      ));

    // Entretiens à venir
    const upcomingInterviewsResult = await db.select({ count: count() })
      .from(interviews)
      .innerJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .where(and(
        eq(jobApplications.candidateUserId, candidateId),
        gte(interviews.interviewDate, today)
      ));

    // Offres d'emploi postulées
    const uniqueJobOffersResult = await db.select({
      count: sql`COUNT(DISTINCT ${jobApplications.jobOfferId})`
    })
      .from(jobApplications)
      .where(eq(jobApplications.candidateUserId, candidateId));

    // Prochain entretien
    const nextInterviewResult = await db.select({
      interviewDate: interviews.interviewDate,
      interviewTime: interviews.interviewTime,
      status: interviews.status,
      jobTitle: jobOffers.title,
      department: jobOffers.department
    })
      .from(interviews)
      .innerJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .innerJoin(jobOffers, eq(jobApplications.jobOfferId, jobOffers.id))
      .where(and(
        eq(jobApplications.candidateUserId, candidateId),
        gte(interviews.interviewDate, today)
      ))
      .orderBy(interviews.interviewDate)
      .limit(1);

    const stats = {
      totalApplications: totalApplicationsResult[0]?.count || 0,
      acceptedApplications: acceptedApplicationsResult[0]?.count || 0,
      rejectedApplications: rejectedApplicationsResult[0]?.count || 0,
      pendingApplications: pendingApplicationsResult[0]?.count || 0,
      totalInterviews: totalInterviewsResult[0]?.count || 0,
      pastInterviews: pastInterviewsResult[0]?.count || 0,
      upcomingInterviews: upcomingInterviewsResult[0]?.count || 0,
      uniqueJobOffers: uniqueJobOffersResult[0]?.count || 0,
      nextInterview: nextInterviewResult[0] || null,
      successRate: totalApplicationsResult[0]?.count > 0 ?
        Math.round((acceptedApplicationsResult[0]?.count || 0) / totalApplicationsResult[0]?.count * 100) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques candidat:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getAllCandidates, getCandidateById, getCandidateStats };