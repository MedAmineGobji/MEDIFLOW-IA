const db = require('../config/database')
const { 
  jobApplications, 
  interviews, 
  jobOffers, 
  cvAnalyses, 
  users, 
  appointments 
} = require('../../../database/schema')
const { sql, count } = require('drizzle-orm')

const getHRStats = async (req, res) => {
  try {
    const userId = req.user.id

    console.log('📊 Récupération des statistiques RH...')

    // Statistiques générales des candidatures
    const totalApplications = await db.select().from(jobApplications).execute()
    const totalApplicationsCount = totalApplications.length
    console.log('📝 Total candidatures:', totalApplicationsCount)

    // Candidatures par statut
    const applicationsByStatus = await db
      .select({
        status: jobApplications.status,
        count: count(jobApplications.id)
      })
      .from(jobApplications)
      .groupBy(jobApplications.status)
      .execute()

    console.log('📊 Candidatures par statut:', applicationsByStatus)
    
    const acceptedApplications = parseInt(applicationsByStatus.find(s => s.status === 'acceptée')?.count || 0)
    const rejectedApplications = parseInt(applicationsByStatus.find(s => s.status === 'refusée')?.count || 0)
    const pendingApplications = parseInt(applicationsByStatus.find(s => s.status === 'en cours')?.count || 0)
    const submittedApplications = parseInt(applicationsByStatus.find(s => s.status === 'soumise')?.count || 0)

    // Statistiques des entretiens
    const totalInterviews = await db.select().from(interviews).execute()
    const totalInterviewsCount = totalInterviews.length
    console.log('🎤 Total entretiens:', totalInterviewsCount)

    // Entretiens par statut
    const interviewsByStatus = await db
      .select({
        status: interviews.status,
        count: count(interviews.id)
      })
      .from(interviews)
      .groupBy(interviews.status)
      .execute()

    console.log('📊 Entretiens par statut:', interviewsByStatus)

    const scheduledInterviews = parseInt(interviewsByStatus.find(s => s.status === 'planifié' || s.status === 'scheduled')?.count || 0)
    const completedInterviews = parseInt(interviewsByStatus.find(s => s.status === 'terminé' || s.status === 'completed')?.count || 0)
    const cancelledInterviews = parseInt(interviewsByStatus.find(s => s.status === 'annulé' || s.status === 'cancelled')?.count || 0)

    // Statistiques des offres d'emploi
    const totalJobOffers = await db.select().from(jobOffers).execute()
    const totalJobOffersCount = totalJobOffers.length
    console.log('💼 Total offres:', totalJobOffersCount)

    // Offres actives vs inactives
    const activeJobOffers = totalJobOffers.filter(offer => offer.isActive).length
    const inactiveJobOffers = totalJobOffersCount - activeJobOffers

    // Statistiques des analyses CV
    const totalCvAnalyses = await db.select().from(cvAnalyses).execute()
    const totalCvAnalysesCount = totalCvAnalyses.length
    console.log('📄 Total analyses CV:', totalCvAnalysesCount)

    // Analyses par score
    const cvAnalysesByScore = totalCvAnalyses.reduce((acc, analysis) => {
      const score = analysis.matchScore
      if (score >= 80) acc.excellent++
      else if (score >= 60) acc.good++
      else acc.needsImprovement++
      return acc
    }, { excellent: 0, good: 0, needsImprovement: 0 })

    // Statistiques temporelles - candidatures cette semaine
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const applicationsThisWeek = totalApplications.filter(app =>
      new Date(app.createdAt) >= oneWeekAgo
    ).length

    // Candidatures ce mois
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const applicationsThisMonth = totalApplications.filter(app =>
      new Date(app.createdAt) >= oneMonthAgo
    ).length

    // Taux de succès (candidatures acceptées / total)
    const successRate = totalApplicationsCount > 0 ?
      Math.round((acceptedApplications / totalApplicationsCount) * 100) : 0

    // Taux de conversion entretien (acceptés / entretiens terminés)
    const interviewConversionRate = completedInterviews > 0 ?
      Math.round((acceptedApplications / completedInterviews) * 100) : 0

    // Statistiques des utilisateurs par rôle
    const usersByRole = await db
      .select({
        role: users.role,
        count: count(users.id)
      })
      .from(users)
      .groupBy(users.role)
      .execute()

    console.log('👥 Utilisateurs par rôle:', usersByRole)

    const totalDoctors = parseInt(usersByRole.find(u => u.role === 'doctor')?.count || 0)
    const totalPatients = parseInt(usersByRole.find(u => u.role === 'patient')?.count || 0)
    const totalCandidates = parseInt(usersByRole.find(u => u.role === 'candidate')?.count || 0)
    const totalHR = parseInt(usersByRole.find(u => u.role === 'hrRecruiter' || u.role === 'hr')?.count || 0)

    // Statistiques des rendez-vous médicaux
    const totalAppointments = await db.select().from(appointments).execute()
    const totalAppointmentsCount = totalAppointments.length
    console.log('📅 Total rendez-vous:', totalAppointmentsCount)

    // Rendez-vous par statut
    const appointmentsByStatus = await db
      .select({
        status: appointments.status,
        count: count(appointments.id)
      })
      .from(appointments)
      .groupBy(appointments.status)
      .execute()

    console.log('📊 Rendez-vous par statut:', appointmentsByStatus)

    const completedAppointments = parseInt(appointmentsByStatus.find(s => s.status === 'terminé')?.count || 0)
    const scheduledAppointments = parseInt(appointmentsByStatus.find(s => s.status === 'planifié' || s.status === 'en attente')?.count || 0)
    const cancelledAppointments = parseInt(appointmentsByStatus.find(s => s.status === 'annulé')?.count || 0)

    const stats = {
      // Statistiques des candidatures
      totalApplications: totalApplicationsCount,
      acceptedApplications,
      rejectedApplications,
      pendingApplications,
      submittedApplications,
      applicationsThisWeek,
      applicationsThisMonth,

      // Statistiques des entretiens
      totalInterviews: totalInterviewsCount,
      scheduledInterviews,
      completedInterviews,
      cancelledInterviews,

      // Statistiques des offres d'emploi
      totalJobOffers: totalJobOffersCount,
      activeJobOffers,
      inactiveJobOffers,

      // Statistiques des analyses CV
      totalCvAnalyses: totalCvAnalysesCount,
      excellentCvAnalyses: cvAnalysesByScore.excellent,
      goodCvAnalyses: cvAnalysesByScore.good,
      needsImprovementCvAnalyses: cvAnalysesByScore.needsImprovement,

      // Taux et métriques
      successRate,
      interviewConversionRate,

      // Statistiques des utilisateurs
      totalUsers: totalDoctors + totalPatients + totalCandidates + totalHR,
      totalDoctors,
      totalPatients,
      totalCandidates,
      totalHR,

      // Statistiques médicales
      totalAppointments: totalAppointmentsCount,
      completedAppointments,
      scheduledAppointments,
      cancelledAppointments
    }

    console.log('✅ Statistiques RH calculées:', stats)
    res.json(stats)
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques HR:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

module.exports = {
  getHRStats
}