export interface CreateOrderDto {
  customerId: number;
  status: string;
  totalPrice: number;
  subscriptions: SubscriptionAttrs[];
  discount: number;
  expiresAt?: Date;
  couponId?: string;
}

export interface SubscriptionAttrs {
  packageGroupId: string;
  price: number;
  unitPrice: number;
  numberOfSeats?: number;
  durationType?: number;
  startsAt?: Date;
  endsAt?: Date;
}
