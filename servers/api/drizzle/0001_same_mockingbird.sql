ALTER TABLE "networks" DROP CONSTRAINT "networks_parent_networks_id_fk";
--> statement-breakpoint
ALTER TABLE "networks" ADD CONSTRAINT "parentReference" FOREIGN KEY ("parent") REFERENCES "public"."networks"("id") ON DELETE no action ON UPDATE no action;