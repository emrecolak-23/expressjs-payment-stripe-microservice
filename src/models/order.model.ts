import mongoose, { Schema, Document, Model } from "mongoose";

export interface SubscriptionAttrs {
  packageGroupId: string;
  price: number;
  unitPrice: number;
  numberOfSeats?: number;
  durationType?: number;
  startsAt?: Date;
  endsAt?: Date;
}

export interface OrderAttrs {
  orderNo: number;
  customerId: number;
  status: string;
  totalPrice: number;
  subscriptions: SubscriptionAttrs[];
  discount: number;
  expiresAt?: Date;
  couponId?: string;
}

export interface OrderDoc extends Document, OrderAttrs {}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new Schema(
  {
    orderNo: { type: Number, required: true },
    customerId: { type: Number, required: true },
    status: { type: String, required: true },
    expiresAt: { type: Date },
    totalPrice: { type: Number, required: true },
    subscriptions: [
      {
        packageGroupId: {
          type: Schema.Types.ObjectId,
          ref: "Subscription-Package",
          required: true,
        },
        unitPrice: { type: Number, required: true },
        price: { type: Number, required: true },
        numberOfSeats: { type: Number },
        durationType: { type: Number },
        startsAt: { type: Date },
        endsAt: { type: Date },
      },
    ],
    discount: { type: Number },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order, OrderModel };
