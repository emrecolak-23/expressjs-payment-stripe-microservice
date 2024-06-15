export interface CreateCouponDto {
  authorizationName: string;
  discount: number;
  expirationDate: Date;
  isSubs: boolean;
}
