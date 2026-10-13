-- Add rejection_reason column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update default status to 'en attente'
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'en attente';
