CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" text DEFAULT 'admin',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"doctor_id" integer,
	"appointment_date" timestamp NOT NULL,
	"status" text DEFAULT 'scheduled',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"resume" text,
	"skills" text,
	"experience" text,
	"status" text DEFAULT 'applied',
	"ai_analysis" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "candidates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"specialty" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "doctors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "hr_recruiters" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"department" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hr_recruiters_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"doctor_id" integer,
	"diagnosis" text,
	"treatment" text,
	"prescription" text,
	"notes" text,
	"record_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"date_of_birth" timestamp,
	"address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "patients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;