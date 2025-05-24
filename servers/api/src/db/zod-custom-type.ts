import { string } from "zod";

export const isBigInt = (...value: Parameters<typeof BigInt>) => {
  try {
    BigInt(...value);
    return true;
  } catch {
    return false;
  }
};

export const bigInt = () =>
  string()
    .refine((value) => isBigInt(value), {
      message: "must be a valid bigint string",
    })
    .transform((value) => BigInt(value));
