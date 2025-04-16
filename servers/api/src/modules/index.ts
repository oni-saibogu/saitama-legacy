import type { FastifyInstance } from "fastify";

import registerAppRoutes from "./apps/app.route";
import registerAuthRoutes from "./auth/auth.route";
import registerUserRoutes from "./user/users.route";
import registerWalletRoutes from "./wallets/wallet.route";
import registerApiKeyRoutes from "./apiKeys/apiKey.route";
import registerPaymentRoutes from "./payments/payment.route";
import registerWebhookRoutes from "./webhooks/webhook.route";
import registerCustomerRoutes from "./customers/customers.route";
import registerPaymentLinkRoutes from "./paymentLinks/paymentLinks.route";

export default function registerRoutes(fastify: FastifyInstance) {
  registerAppRoutes(fastify);
  registerAuthRoutes(fastify);
  registerUserRoutes(fastify);
  registerApiKeyRoutes(fastify);
  registerWalletRoutes(fastify);
  registerPaymentRoutes(fastify);
  registerWebhookRoutes(fastify);
  registerCustomerRoutes(fastify);
  registerPaymentLinkRoutes(fastify);
}
