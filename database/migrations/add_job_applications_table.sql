CREATE TABLE IF NOT EXISTS "job_applications" (
  "id" serial PRIMARY KEY NOT NULL,
  "job_offer_id" integer REFERENCES "job_offers"("id") ON DELETE CASCADE,
  "candidate_user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
  "cv_url" text,
  "cover_letter" text,
  "status" text DEFAULT 'soumise',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

