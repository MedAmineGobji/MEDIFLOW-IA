-- Migration: Add prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id),
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES doctors(id),
  medications TEXT NOT NULL,
  diagnosis TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
