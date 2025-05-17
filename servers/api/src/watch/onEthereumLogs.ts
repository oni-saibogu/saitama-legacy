import { eq } from "drizzle-orm";
import { db, viem } from "../instances";
import { wallets } from "../db/schema";

const unsubscribe = viem.watchEvent({
  event: {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", indexed: true, name: "from" },
      { type: "address", indexed: true, name: "to" },
      { type: "uint256", indexed: false, name: "value" },
    ],
  },
  onLogs: async (logs) => {
    for (const log of logs) {
      if (log.args.from && log.args.to && log.args.value) {
        const { to } = log.args;

        const wallet = await db.query.wallets
          .findFirst({
            where: eq(wallets.address, to),
          })
          .execute();
        const coin = aw
        if(wallet){}
      }
    }
  },
});

process.on("SIGINT", unsubscribe);
process.on("SIGTERM", unsubscribe);
