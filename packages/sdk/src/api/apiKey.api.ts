import { Crud } from "./impl";
import type { ApiKey } from "./models";

export class ApiKeyApi extends Crud<ApiKey> {
  protected path: string = "apiKeys";
}
