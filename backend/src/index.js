const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (CV, etc.)
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const medicalRecordRoutes = require('./routes/medicalRecords');
const jobOfferRoutes = require('./routes/jobOffers');
const jobApplicationRoutes = require('./routes/jobApplications');
const candidateRoutes = require('./routes/candidates');
const cvAnalysisRoutes = require('./routes/cvAnalysis');
const interviewRoutes = require('./routes/interviews');
const notificationRoutes = require('./routes/notifications');
const prescriptionRoutes = require('./routes/prescriptions');
const hrRoutes = require('./routes/hr');
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/job-offers', jobOfferRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/cv-analysis', cvAnalysisRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'MediFlow AI Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});