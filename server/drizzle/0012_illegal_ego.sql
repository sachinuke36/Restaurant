DROP INDEX "user_default_address";--> statement-breakpoint
CREATE UNIQUE INDEX "user_default_address" ON "address" USING btree ("user_id") WHERE "address"."is_default" = true;