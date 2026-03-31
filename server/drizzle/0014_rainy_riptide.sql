ALTER TABLE "orders" ADD COLUMN "payment_intent_id" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" "payment_method" DEFAULT 'cash';