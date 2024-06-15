import mongoose, { Schema, Document, Model } from "mongoose";

export interface CartItem {
  packageGroupId: string;
  unitPrice: number;
  numberOfSeats?: number;
  durationType?: number;
  price: number;
}

export interface CartAttrs {
  customerId: number;
  items: CartItem[];
  discount?: number;
  couponId?: string;
}

export interface CartDoc extends Document {
  customerId: number;
  items: CartItem[];
  discount?: number;
  couponId?: string;
}

interface CartModel extends Model<CartDoc> {
  build(attrs: CartAttrs): CartDoc;
}

const cartSchema = new Schema(
  {
    customerId: {
      type: Number,
      required: true,
    },
    items: [
      {
        packageGroupId: {
          type: Schema.Types.ObjectId,
          ref: "Subscription-Package",
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        numberOfSeats: {
          type: Number,
        },
        durationType: {
          type: Number,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    discount: {
      type: Number,
      required: false,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cartSchema.statics.build = (attrs: CartAttrs) => {
  return new Cart(attrs);
};

const Cart = mongoose.model<CartDoc, CartModel>("Cart", cartSchema);

export { Cart, CartModel };
