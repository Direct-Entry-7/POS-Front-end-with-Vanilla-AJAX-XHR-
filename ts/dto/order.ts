export class Order {
  public constructor(
    public orderId: string,
    public orderDate: Date,
    public customerId: string,
    public customerName: string,
    public orderTotal: number,
    public orderDetails: Array<any>
  ) {}
}
