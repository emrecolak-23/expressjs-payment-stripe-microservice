import { CartItem } from "../models";

export interface UseCouponDto {
  userId: number;
  couponId: number;
  cartItems: CartItem[];
  cartId: string;
}
