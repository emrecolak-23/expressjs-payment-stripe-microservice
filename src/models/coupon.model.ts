import mongoose, { Schema, Model, Document } from "mongoose";

export interface CouponAttrs {
  code: string;
  authorizationName: string;
  discount: number;
  expirationDate: Date;
  isSubs: boolean;
  isSingleUse: boolean;
  trialDuration?: number;
  isOnlyForOneCompany?: boolean;
}

export interface CouponDoc extends Document {
  code: string;
  authorizationName: string;
  discount: number;
  expirationDate: Date;
  isActive: boolean;
  isSubs: boolean;
  isSingleUse: boolean;
  trialDuration?: number;
  isOnlyForOneCompany?: boolean;
}

export interface CouponModel extends Model<CouponDoc> {
  build(attrs: CouponAttrs): CouponDoc;
}

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    authorizationName: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSingleUse: {
      type: Boolean,
      default: false,
    },
    isSubs: {
      type: Boolean,
      default: false,
    },
    trialDuration: {
      type: Number,
    },
    isOnlyForOneCompany: {
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

couponSchema.statics.build = (attrs: CouponAttrs) => {
  return new Coupon(attrs);
};

const Coupon = mongoose.model<CouponDoc, CouponModel>("Coupon", couponSchema);

export { Coupon };
