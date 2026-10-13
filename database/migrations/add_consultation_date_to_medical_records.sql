-- Migration: Add consultation_date and appointment_id to medical_records
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS appointment_id INTEGER REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS consultation_date TIMESTAMP;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment ON medical_records(appointment_id);
