import {} from "ethers";
import {} from "tronweb";
import { eq, or } from "drizzle-orm";
import { web3 } from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { coins, wallets } from "../db/schema";
import type { selectWalletSchema } from "../db/zod";
import { db, solanaConnection } from "../instances";
import type {
  ParsedSplTokenTransferChecked,
  ParsedTokenTransfer,
} from "./models";
import { format } from "../core";

export const tokenProgramIds = new Set([
  TOKEN_PROGRAM_ID.toBase58(),
  TOKEN_2022_PROGRAM_ID.toBase58(),
]);

export const programIds = [
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  web3.SystemProgram.programId,
];

export const onSolanaLogs = async (
  ...[{ signature }]: Parameters<web3.LogsCallback>
) => {
  console.log(
    format(
      "[logs.processing] processing transactions for signature=%",
      signature
    )
  );

  const parsedTransactionWithMeta = await solanaConnection.getParsedTransaction(
    signature,
    {
      commitment: "confirmed",
    }
  );

  if (parsedTransactionWithMeta) {
    const {
      transaction: {
        message: { accountKeys, instructions },
      },
    } = parsedTransactionWithMeta;
    let wallet = await db.query.wallets
      .findFirst({
        where: or(
          ...accountKeys.map((accountKey) =>
            eq(wallets.address, accountKey.pubkey.toBase58())
          )
        ),
      })
      .execute();

    const coin = await db.query.coins
      .findFirst({
        with: {
          network: true,
        },
        where: or(
          ...accountKeys.map((accountKey) =>
            eq(coins.mint, accountKey.pubkey.toBase58())
          )
        ),
      })
      .execute();

    const processInstruction = (
      wallet: Omit<Zod.infer<typeof selectWalletSchema>, "metadata">
    ) => {
      console.log(
        format("[wallet.process] processing payment for wallet=%", wallet.id)
      );

      instructions.map((instruction) => {
        if (instruction.programId.equals(web3.SystemProgram.programId)) {
          if ("parsed" in instruction) {
            const parsed = instruction.parsed as ParsedTokenTransfer;
            console.log(parsed);
          }
        } else if (tokenProgramIds.has(instruction.programId.toBase58())) {
          if ("parsed" in instruction) {
            const parsed = instruction.parsed as ParsedSplTokenTransferChecked;
            console.log(parsed.info.tokenAmount.amount);
          }
        }
      });
    };

    if (!wallet) {
      const [, , associatedTokenAccount] = accountKeys.map(
        (accountKey) => accountKey.pubkey
      );
      const accountInfo = await solanaConnection.getParsedAccountInfo(
        associatedTokenAccount
      );

      if (accountInfo && accountInfo.value) {
        const data = accountInfo.value.data;

        if ("parsed" in data) {
          wallet = await db.query.wallets
            .findFirst({
              where: eq(wallets.address, data.parsed.info.owner),
            })
            .execute();
        }
      }
    }

    if (wallet) return processInstruction(wallet);
    else
      console.log(
        format(
          "[logs.wallet.notfound] no wallet found for signature=%",
          signature
        )
      );
  }
};

const subscriptions = programIds.map((programId) =>
  solanaConnection.onLogs(programId, onSolanaLogs)
);

process.on("SIGINT", () =>
  Promise.all(
    subscriptions.map((subscription) =>
      solanaConnection.removeOnLogsListener(subscription)
    )
  )
);
process.on("SIGTERM", () =>
  Promise.all(
    subscriptions.map((subscription) =>
      solanaConnection.removeOnLogsListener(subscription)
    )
  )
);
