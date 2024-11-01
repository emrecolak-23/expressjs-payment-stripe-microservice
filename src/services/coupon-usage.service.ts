import { Types } from "mongoose";
import {
  CouponUsageModel,
  CouponUsage,
  CouponUsageDoc,
  CouponDoc,
} from "../models";
import { CartItem } from "../models";
import { UseCouponDto } from "../dtos";
import { SubscriptionPackageDoc } from "../models";

export class CouponUsageService {
  static instance: CouponUsageService;

  static getInstance(): CouponUsageService {
    if (!this.instance) {
      this.instance = new CouponUsageService();
    }
    return this.instance;
  }

  couponUsageModel: CouponUsageModel;
  private constructor() {
    this.couponUsageModel = CouponUsage;
  }

  async chekcCouponUsageForOneTime(couponId: Types.ObjectId) {
    const usedCoupon = await this.couponUsageModel.findOne({
      couponId,
      isUsed: true,
    });

    return usedCoupon;
  }

  async updateCouponUsed(couponId: Types.ObjectId, cartId: Types.ObjectId) {
    return await this.couponUsageModel.findOneAndUpdate(
      { couponId, cartId },
      { isUsed: true }
    );
  }

  async checkCouponUsage(params: Partial<UseCouponDto>) {
    const { couponId, userId, cartItems } = params;

    const usedCoupon = await this.couponUsageModel.findOne({
      couponId,
      userId,
      packageId: {
        $in: cartItems!.map(
          (item: CartItem) => new Types.ObjectId(item.packageGroupId)
        ),
      },
    });

    return usedCoupon;
  }

  async deleteCouponUsage(cartId: string) {
    return await this.couponUsageModel.deleteOne({
      cartId: new Types.ObjectId(cartId),
    });
  }

  async checkCouponExistInCart(params: Partial<UseCouponDto>) {
    const { cartId, userId } = params;

    const usedCoupon = await this.couponUsageModel.findOne({
      cartId: new Types.ObjectId(cartId!),
      userId,
      isUsed: false,
    });

    return usedCoupon;
  }

  async useCoupon(params: Partial<UseCouponDto>): Promise<CouponUsageDoc> {
    const { couponId, userId, cartId } = params;

    const newCouponUsage = this.couponUsageModel.build({
      couponId: couponId!,
      userId: userId!,
      cartId: cartId!,
    });

    await newCouponUsage.save();

    return newCouponUsage;
  }

  async cancelCouponUsage(userId: number, cartId: string) {
    return await this.couponUsageModel.deleteOne({ userId, cartId });
  }

  async getCurrentCartCoupon(cartId: string, userId: number) {
    const existingCouponUsage:
      | (Exclude<CouponUsageDoc, "couponId"> & {
          couponId: CouponDoc;
        })
      | null = await this.couponUsageModel
      .findOne({
        userId,
        cartId: new Types.ObjectId(cartId),
        isUsed: false,
      })
      .populate("couponId")
      .lean();

    return existingCouponUsage;
  }

  async couponCodeUsage(couponCode: string) {
    const pipeline = [
      {
        $lookup: {
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "couponInfo",
        },
      },
      {
        $unwind: {
          path: "$couponInfo",
        },
      },
      {
        $group: {
          _id: "$couponInfo._id",
          couponCode: { $first: "$couponInfo.code" },
          authorizedName: { $first: "$couponInfo.authorizationName" },
          usedCount: {
            $sum: { $cond: { if: "$isUsed", then: 1, else: 0 } },
          },
        },
      },
      {
        $match: {
          couponCode,
        },
      },
      {
        $project: {
          _id: 0,
          couponCode: 1,
          authorizedName: 1,
          usedCount: 1,
        },
      },
    ];

    const couponUsage = await this.couponUsageModel.aggregate(pipeline);
    return couponUsage;
  }

  async couponCodePriceInsights(couponCode: string) {
    const pipeline: any = [
      {
        $match: {
          isUsed: true,
        },
      },
      {
        $lookup: {
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "couponInfo",
        },
      },
      {
        $unwind: {
          path: "$couponInfo",
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "packageInfo",
        },
      },
      {
        $unwind: {
          path: "$packageInfo",
        },
      },
      {
        $addFields: {
          packageInfo: {
            $cond: {
              if: { $eq: [{ $size: "$packageInfo" }, 0] },
              then: null,
              else: "$packageInfo",
            },
          },
        },
      },
      {
        $group: {
          _id: "$couponInfo._id",
          couponCode: { $first: "$couponInfo.code" },
          discount: { $first: "$couponInfo.discount" },
          authorizedName: { $first: "$couponInfo.authorizationName" },
          usedCount: {
            $sum: { $cond: { if: "$isUsed", then: 1, else: 0 } },
          },
          packageInfo: { $push: "$packageInfo" },
        },
      },
      {
        $match: {
          couponCode,
        },
      },
    ];

    const result = await this.couponUsageModel.aggregate(pipeline);
    const totalPrice = result[0].packageInfo.reduce(
      (curr: number, product: SubscriptionPackageDoc) => {
        return (curr += product.price);
      },
      0
    );

    result[0].totalPrice = parseFloat(totalPrice.toFixed(2));
    result[0].discountedPrice =
      result[0].totalPrice - (result[0].totalPrice * result[0].discount) / 100;

    return result;
  }
}
