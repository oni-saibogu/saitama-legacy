import { Crud } from "./impl";
import type { Coin } from "./models";

export class CoinApi extends Crud<Coin> {
  protected path: string = "coins";
}
