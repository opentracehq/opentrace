ALTER TABLE "error_report" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "error_report" ADD COLUMN "message" text NOT NULL;--> statement-breakpoint
ALTER TABLE "error_report" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "error_report" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "error_report" ADD COLUMN "line" integer;--> statement-breakpoint
ALTER TABLE "error_report" ADD COLUMN "column" integer;--> statement-breakpoint
ALTER TABLE "error_report" ADD COLUMN "stack" text;--> statement-breakpoint
ALTER TABLE "error_report" ADD COLUMN "user_agent" text;