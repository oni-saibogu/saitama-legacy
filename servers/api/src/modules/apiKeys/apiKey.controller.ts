import { promisify } from "util";
import { and, eq } from "drizzle-orm";
import { generateKeyPair } from "crypto";

import type { Database } from "../../db";
import { apiKeys } from "../../db/schema";
import { encrypt } from "../../core/secret";
import { secretKey } from "../../instances";
import type {
  insertApiKeySchema,
  selectApiKeySchema,
  selectAppSchema,
} from "../../db/zod";

export const createApiKey = async (
  db: Database,
  value: Zod.infer<typeof insertApiKeySchema>
) => {
  const { privateKey, publicKey } = await promisify(generateKeyPair)(
    "ed25519",
    {
      publicKeyEncoding: { type: "spki", format: "der" },
      privateKeyEncoding: { type: "pkcs8", format: "der" },
    }
  );

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      ...value,
      publicKey: publicKey.toBase64(),
      secretKey: encrypt(secretKey, privateKey.toBase64()),
    })
    .returning()
    .execute();

  return { ...apiKey, publicKey, secretKey };
};

export const getApiKeysByApp = async (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"]
) =>
  db.query.apiKeys
    .findMany({
      where: eq(apiKeys.app, app),
    })
    .execute();

export const deleteApiKeyByAppAndId = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectApiKeySchema>["id"]
) =>
  db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.app, app)))
    .returning()
    .execute();
