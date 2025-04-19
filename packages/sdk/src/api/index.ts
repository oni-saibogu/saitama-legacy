import xior, { type XiorInstance } from "xior";

import { AppApi } from "./app.api";
import { WalletApi } from "./wallet.api";
import { ApiKeyApi } from "./apiKey.api";
import { WebhookApi } from "./webhook.api";
import { PaymentApi } from "./payment.api";
import { CustomerApi } from "./customer.api";
import { PaymentLinkApi } from "./paymentLink.api";

export * from "./models";

export class Api {
  private readonly xior: XiorInstance;

  readonly app: AppApi;
  readonly apiKey: ApiKeyApi;
  readonly wallet: WalletApi;
  readonly payment: PaymentApi;
  readonly webhook: WebhookApi;
  readonly customer: CustomerApi;
  readonly paymentLink: PaymentLinkApi;

  constructor(
    private readonly endpoint: string,
    private readonly accessToken: string,
    private readonly appId?: string
  ) {
    const headers: { Authorization?: string; "x-app-id"?: string } = {
      Authorization: "Bearer " + this.accessToken,
    };

    if (this.appId) headers["x-app-id"] = this.appId;

    this.xior = xior.create({
      baseURL: this.endpoint,
      headers,
    });

    this.app = new AppApi(this.xior);
    this.apiKey = new ApiKeyApi(this.xior);
    this.wallet = new WalletApi(this.xior);
    this.webhook = new WebhookApi(this.xior);
    this.payment = new PaymentApi(this.xior);
    this.customer = new CustomerApi(this.xior);
    this.paymentLink = new PaymentLinkApi(this.xior);
  }
}

export default Api;
