CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"related_id" integer,
	"is_read" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "status" SET DEFAULT 'scheduled';--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;