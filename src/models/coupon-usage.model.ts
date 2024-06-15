import mongoose, { Schema, Document, Model } from "mongoose";

export interface CouponUsageAttrs {
  userId: number;
  couponId: number;
  cartId: string;
}

export interface CouponUsageDoc extends Document {
  userId: number;
  couponId: number;
  isUsed: boolean;
  cartId: string;
  packageId?: string[];
}

export interface CouponUsageModel extends Model<CouponUsageDoc> {
  build(attrs: CouponUsageAttrs): CouponUsageDoc;
}

const couponUsageSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    cartId: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    packageId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Package",
        required: false,
      },
    ],
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

couponUsageSchema.statics.build = (attrs: CouponUsageAttrs) => {
  return new CouponUsage(attrs);
};

const CouponUsage = mongoose.model<CouponUsageDoc, CouponUsageModel>(
  "CouponUsage",
  couponUsageSchema
);

export { CouponUsage };
