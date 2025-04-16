import assert from "assert";
import { createMemoInstruction } from "@solana/spl-memo";
import { web3, type AnchorProvider } from "@coral-xyz/anchor";
import { createAssociatedTokenAccountIdempotentInstruction } from "@solana/spl-token";
import {
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  NATIVE_MINT_2022,
} from "@solana/spl-token";

import { NetworkImpl } from "./impl";
import type { Api, Payment } from "../../api";

export class SolanaPayment extends NetworkImpl {
  constructor(
    private provider: {
      publicKey: web3.PublicKey;
      sendAndConfirm: AnchorProvider["sendAndConfirm"];
    },
    protected readonly api: Api
  ) {
    super(api);
  }

  static isNative(mint: web3.PublicKey) {
    return NATIVE_MINT.equals(mint) || NATIVE_MINT_2022.equals(mint);
  }

  readonly initializePayment = async (payment: Payment, isNative: boolean) => {
    assert(
      payment.wallet.chain === "solana",
      "expected payment.wallet.chain to be solana"
    );

    const sender = this.provider.publicKey!;
    const recipient = new web3.PublicKey(payment.wallet.address);
    const data = Buffer.from(JSON.stringify({ id: payment.id })).toString(
      "binary"
    );

    const instructions: web3.TransactionInstruction[] = [
      createMemoInstruction(data, [sender]),
    ];

    if (isNative) {
      instructions.push(
        web3.SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipient,
          lamports: BigInt(payment.amount),
        })
      );
    } else {
      const mint = new web3.PublicKey(payment.mint!);

      const senderAta = getAssociatedTokenAddressSync(mint, sender, true);
      const recipientAta = getAssociatedTokenAddressSync(mint, recipient, true);

      instructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          senderAta,
          recipientAta,
          recipient,
          mint
        )
      );
    }

    const transaction = new web3.Transaction().add(...instructions);

    const signature = await this.provider.sendAndConfirm(
      transaction,
      undefined,
      { commitment: "single" }
    );

    return this.api.payment
      .update(payment.id, { signature })
      .then(({ data }) => data);
  };
}
