import type { XiorResponse } from "xior";
import type { Api, Payment } from "../../api";

export abstract class NetworkImpl {
  constructor(protected readonly api: Api) {}

  abstract initializePayment(
    payment: Payment,
    isNative: boolean
  ): Promise<Payment | XiorResponse<Payment>>;
}
