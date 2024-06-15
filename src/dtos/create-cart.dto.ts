export interface CreateCartDto {
  customerId: number;
  items: [
    {
      packageGroupId: string;
      unitPrice: number;
      numberOfSeats?: number;
      durationType?: number;
      price: number;
    }
  ];
}
