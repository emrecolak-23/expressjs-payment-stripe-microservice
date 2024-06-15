import mongoose, { Schema, Document, Model } from "mongoose";

export interface PaymentsAttrs {
  customerId: number;
  paidPrice: number;
  currency: string;
  paymentType: string;
  status: string;
  orderId: string;
}

export interface PaymentsDoc extends Document {
  customerId: number;
  paidPrice: number;
  currency: string;
  paymentType: string;
  status: string;
  orderId: string;
}

interface PaymentsModel extends Model<PaymentsDoc> {
  build(attrs: PaymentsAttrs): PaymentsDoc;
}

const paymentsSchema = new Schema(
  {
    customerId: { type: Number, required: true },
    paidPrice: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentType: { type: String, required: true },
    status: { type: String, required: true },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Orders",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentsSchema.statics.build = (attrs: PaymentsAttrs) => {
  return new Payments(attrs);
};

const Payments = mongoose.model<PaymentsDoc, PaymentsModel>(
  "Payments",
  paymentsSchema
);

export { Payments, PaymentsModel };
