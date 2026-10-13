CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer,
	"interviewer_id" integer,
	"interview_date" timestamp NOT NULL,
	"interview_time" text,
	"status" text DEFAULT 'planifié',
	"notes" text,
	"feedback" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_job_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_id_users_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;