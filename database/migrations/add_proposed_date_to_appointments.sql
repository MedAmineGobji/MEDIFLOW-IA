-- Add proposed_date and proposed_by columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS proposed_date TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS proposed_by TEXT;

-- Update to handle the new status
-- No need to update existing rows as the new columns can be NULL initially
