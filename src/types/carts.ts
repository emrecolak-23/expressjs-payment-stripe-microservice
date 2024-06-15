type CartPackageGroup = string | { _id: string; name: string };

export interface ICartItem {
  packageGroupId: CartPackageGroup;
  unitPrice: number;
  numberOfSeats?: number | undefined;
  durationType?: number | undefined;
  price: number;
}
