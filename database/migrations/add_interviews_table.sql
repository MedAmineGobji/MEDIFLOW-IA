-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES job_applications(id),
    interviewer_id INTEGER REFERENCES users(id),
    interview_date TIMESTAMP NOT NULL,
    interview_time TEXT,
    status TEXT DEFAULT 'planifié',
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);