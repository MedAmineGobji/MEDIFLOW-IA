const { pgTable, serial, text, integer, timestamp } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  address: text('address'),
  bloodGroup: text('blood_group'),
  allergies: text('allergies'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  specialty: text('specialty'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id),
  doctorId: integer('doctor_id').references(() => doctors.id),
  appointmentDate: timestamp('appointment_date').notNull(),
  proposedDate: timestamp('proposed_date'), // Date proposée par le médecin
  status: text('status').default('en attente'), // en attente, accepté, refusé, date_proposée, terminé, annulé
  notes: text('notes'),
  rejectionReason: text('rejection_reason'), // Raison du refus
  proposedBy: text('proposed_by'), // 'doctor' ou 'patient' - qui a proposé la dernière date
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const medicalRecords = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id').references(() => appointments.id),
  patientId: integer('patient_id').references(() => patients.id),
  doctorId: integer('doctor_id').references(() => doctors.id),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  prescription: text('prescription'),
  notes: text('notes'),
  recordDate: timestamp('record_date').defaultNow(),
  consultationDate: timestamp('consultation_date'), // Date du rendez-vous
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const hrRecruiters = pgTable('hr_recruiters', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  department: text('department'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  resume: text('resume'), // URL or path to CV file
  skills: text('skills'),
  experience: text('experience'),
  status: text('status').default('applied'), // applied, reviewed, interviewed, hired, rejected
  aiAnalysis: text('ai_analysis'), // AI analysis of CV
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  role: text('role').default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'admin' | 'doctor' | 'patient' | 'hrRecruiter' | 'candidate'
  roles: text('roles').array(), // Support des rôles multiples
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const jobOffers = pgTable('job_offers', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  location: text('location').notNull(),
  contractType: text('contract_type').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(),
  status: text('status').default('active'), // active, closed, draft
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const jobApplications = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  jobOfferId: integer('job_offer_id').references(() => jobOffers.id),
  candidateUserId: integer('candidate_user_id').references(() => users.id),
  cvUrl: text('cv_url'),
  coverLetter: text('cover_letter'),
  status: text('status').default('soumise'), // soumise, en cours, acceptée, refusée
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const cvAnalyses = pgTable('cv_analyses', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').references(() => jobApplications.id),
  score: integer('score').notNull(),
  recommandation: text('recommandation').notNull(), // 'RECOMMANDÉ', 'À CONSIDÉRER', 'NON RECOMMANDÉ'
  pointsForts: text('points_forts').array(), // Array of strengths
  lacunes: text('lacunes').array(), // Array of weaknesses
  competences: text('competences').array(), // Array of detected skills
  analyseDetaillee: text('analyse_detaillee'), // Detailed analysis text
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const interviews = pgTable('interviews', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').references(() => jobApplications.id),
  interviewerId: integer('interviewer_id').references(() => users.id), // RH qui planifie l'entretien
  interviewDate: timestamp('interview_date').notNull(),
  interviewTime: text('interview_time'), // Format HH:MM
  status: text('status').default('scheduled'), // scheduled, completed, cancelled
  candidateResponse: text('candidate_response').default('pending'), // pending, accepted, declined
  notes: text('notes'), // Notes/ordre du jour de l'entretien
  feedback: text('feedback'), // Retour après l'entretien
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id), // Destinataire de la notification
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'interview_scheduled', 'interview_updated', 'application_status', etc.
  relatedId: integer('related_id'), // ID de l'entité liée (interview, application, etc.)
  isRead: integer('is_read').default(0), // 0 = non lu, 1 = lu
  createdAt: timestamp('created_at').defaultNow(),
});

const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id').references(() => appointments.id),
  patientId: integer('patient_id').references(() => patients.id),
  doctorId: integer('doctor_id').references(() => doctors.id),
  medications: text('medications').notNull(), // JSON string: [{name, dosage, frequency, duration, instructions}]
  diagnosis: text('diagnosis'), // Diagnostic principal
  additionalNotes: text('additional_notes'), // Notes complémentaires
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = {
  patients,
  doctors,
  appointments,
  medicalRecords,
  hrRecruiters,
  candidates,
  admins,
  users,
  jobOffers,
  jobApplications,
  cvAnalyses,
  interviews,
  notifications,
  prescriptions,
};