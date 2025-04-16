import { Crud } from "./impl";
import type { Webhook } from "./models/webhook.model";

export class WebhookApi extends Crud<Webhook> {
  protected path: string = "webhooks";
}
