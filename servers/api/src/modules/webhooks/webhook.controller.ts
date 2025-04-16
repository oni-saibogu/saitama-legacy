import { and, eq } from "drizzle-orm";

import type { Database } from "../../db";
import { webhooks } from "../../db/schema";
import type {
  insertWebhookSchema,
  selectAppSchema,
  selectWebhookSchema,
} from "../../db/zod";

export const createWebhook = (
  db: Database,
  value: Zod.infer<typeof insertWebhookSchema>
) => db.insert(webhooks).values(value).returning().execute();

export const getWebhooksByApp = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"]
) => db.query.webhooks.findMany({ where: eq(webhooks.app, app) }).execute();

export const updateWebhookByAppAndId = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectWebhookSchema>["id"],
  value: Partial<Zod.infer<typeof insertWebhookSchema>>
) =>
  db
    .update(webhooks)
    .set(value)
    .where(and(eq(webhooks.app, app), eq(webhooks.id, id)))
    .returning()
    .execute();

export const deleteWebhookByAppAndId = (
  db: Database,
  id: Zod.infer<typeof selectWebhookSchema>["id"],
  app: Zod.infer<typeof selectAppSchema>["id"]
) =>
  db
    .delete(webhooks)
    .where(and(eq(webhooks.app, app), eq(webhooks.id, id)))
    .returning()
    .execute();
