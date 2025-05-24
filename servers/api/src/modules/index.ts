import type { FastifyInstance } from "fastify";

import registerAppRoutes from "./apps/app.route";
import registerAuthRoutes from "./auth/auth.route";
import registerUserRoutes from "./users/users.route";
import registerCoinRoutes from "./coins/coins.route";
import registerWalletRoutes from "./wallets/wallet.route";
import registerApiKeyRoutes from "./api-keys/api-key.route";
import registerPaymentRoutes from "./payments/payment.route";
import registerWebhookRoutes from "./webhooks/webhook.route";
import registerNetworkRoutes from "./networks/networks.route";
import registerCustomerRoutes from "./customers/customers.route";
import registerPaymentLinkRoutes from "./payment-links/payment-links.route";

export default function registerRoutes(fastify: FastifyInstance) {
  fastify.register(registerAppRoutes, { prefix: "/apps/" });
  fastify.register(registerAuthRoutes, { prefix: "/auth/" });
  fastify.register(registerUserRoutes, { prefix: "/users/" });
  fastify.register(registerCoinRoutes, { prefix: "/coins/" });
  fastify.register(registerApiKeyRoutes, { prefix: "/api-keys/" });
  fastify.register(registerNetworkRoutes, { prefix: "/networks/" });
  fastify.register(registerWalletRoutes, { prefix: "/wallets/" });
  fastify.register(registerPaymentRoutes, { prefix: "/payments/" });
  fastify.register(registerWebhookRoutes, { prefix: "/webhooks/" });
  fastify.register(registerCustomerRoutes, { prefix: "/customers/" });
  fastify.register(registerPaymentLinkRoutes, { prefix: "/payment-links/" });
}
