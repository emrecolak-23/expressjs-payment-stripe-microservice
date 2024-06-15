export interface CreatePaymentDto {
  customerId: number;
  numberOfSeats?: number;
  currency: string;
  paidPrice: number;
  durationType?: number;
  orderId: string;
  status: string;
}
