ALTER TABLE "address" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "address" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "longitude" numeric(10, 7);