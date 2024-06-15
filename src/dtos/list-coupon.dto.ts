import { SortOrder } from "mongoose";

export interface ListCouponDto {
  page: number;
  pageSize: number;
  search: string;
  sort:
    | string
    | { [key: string]: SortOrder | { $meta: any } }
    | [string, SortOrder][]
    | null
    | undefined;
}
