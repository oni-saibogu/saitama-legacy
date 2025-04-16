import { Crud } from "./impl";
import type { Customer } from "./models/customer.model";

export class CustomerApi extends Crud<Customer> {
  protected path: string = "customers";
}
