import { Crud } from "./impl";
import type { PaymentLink } from "./models";

export class PaymentLinkApi extends Crud<PaymentLink> {
  protected path: string = "payment-links";
}
