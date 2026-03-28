ALTER TYPE "public"."order_status" ADD VALUE 'confirmed' BEFORE 'preparing';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'ready' BEFORE 'out_for_delivery';