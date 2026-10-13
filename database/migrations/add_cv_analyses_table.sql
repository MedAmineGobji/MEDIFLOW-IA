-- Create cv_analyses table
CREATE TABLE IF NOT EXISTS cv_analyses (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES job_applications(id),
    score INTEGER NOT NULL,
    recommandation TEXT NOT NULL,
    points_forts TEXT[],
    lacunes TEXT[],
    competences TEXT[],
    analyse_detaillee TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cv_analyses_application_id ON cv_analyses(application_id);