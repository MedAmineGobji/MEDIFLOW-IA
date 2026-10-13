CREATE TABLE "cv_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer,
	"score" integer NOT NULL,
	"recommandation" text NOT NULL,
	"points_forts" text[],
	"lacunes" text[],
	"competences" text[],
	"analyse_detaillee" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cv_analyses" ADD CONSTRAINT "cv_analyses_application_id_job_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE no action ON UPDATE no action;