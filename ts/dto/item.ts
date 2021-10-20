import bigDecimal from "js-big-decimal";
import Big from "big.js";

export class Item {
  constructor(
    public code: string,
    public description: string,
    public unitPrice: Big,
    public qtyOnHand: number
  ) {}
}
