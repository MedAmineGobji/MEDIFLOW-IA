const db = require('./src/config/database');
const { interviews, jobApplications, users } = require('../database/schema');
const { eq } = require('drizzle-orm');

async function checkInterviewsForCandidate() {
  try {
    // Récupérer toutes les candidatures
    const applications = await db.select().from(jobApplications);
    console.log('=== Toutes les candidatures ===');
    applications.forEach(app => {
      console.log(`Application ID: ${app.id}, Candidat ID: ${app.candidateUserId}, Job Offer ID: ${app.jobOfferId}, Status: ${app.status}`);
    });
    
    console.log('\n=== Tous les entretiens ===');
    const allInterviews = await db.select().from(interviews);
    allInterviews.forEach(interview => {
      console.log(`Interview ID: ${interview.id}, Application ID: ${interview.applicationId}, Date: ${interview.interviewDate}, Status: ${interview.status}, Candidat Response: ${interview.candidateResponse}`);
    });
    
    console.log('\n=== Vérification candidat ID 6 ===');
    const candidate6Apps = await db.select().from(jobApplications).where(eq(jobApplications.candidateUserId, 6));
    console.log(`Nombre de candidatures pour candidat 6: ${candidate6Apps.length}`);
    
    for (const app of candidate6Apps) {
      console.log(`\nApplication ID: ${app.id}`);
      const interviewsForApp = await db.select().from(interviews).where(eq(interviews.applicationId, app.id));
      console.log(`Entretiens pour cette application: ${interviewsForApp.length}`);
      interviewsForApp.forEach(int => {
        console.log(`  - Interview ID: ${int.id}, Date: ${int.interviewDate}, Heure: ${int.interviewTime}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkInterviewsForCandidate();
