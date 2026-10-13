CREATE TABLE IF NOT EXISTS "job_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location" text NOT NULL,
	"contract_type" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
