CREATE TABLE "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_offer_id" integer,
	"candidate_user_id" integer,
	"cv_url" text,
	"cover_letter" text,
	"status" text DEFAULT 'soumise',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_offers" (
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
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'prévu';--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_offer_id_job_offers_id_fk" FOREIGN KEY ("job_offer_id") REFERENCES "public"."job_offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidate_user_id_users_id_fk" FOREIGN KEY ("candidate_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;