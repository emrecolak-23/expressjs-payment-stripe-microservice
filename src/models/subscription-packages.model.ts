import mongoose, { Schema, Document, Model } from "mongoose";

interface SubscriptionPackageAttrs {
  title: string;
  price: number;
  currency: string;
  discount?: number;
  durationType: [string];
  status: boolean;
  properties: { title: string; description: string }[];
  details: string;
  banner: [string];
  icon: string;
  isSeatable: boolean;
  explanation: string;
  type: string;
}

interface SubscriptionPackageDoc extends Document {
  title: string;
  price: number;
  currency: string;
  discount?: number;
  durationType: [string];
  status: boolean;
  properties: { title: string; description: string }[];
  details: string;
  banner: [string];
  icon: string;
  isSeatable: boolean;
  explanation: string;
  type: string;
}

interface SubscriptionPackageModel extends Model<SubscriptionPackageDoc> {
  build(attrs: SubscriptionPackageAttrs): SubscriptionPackageDoc;
}

const subscriptionPackageSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    durationType: {
      type: [String],
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    properties: {
      type: [{ title: String, description: String }],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    banner: {
      type: [String],
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    isSeatable: {
      type: Boolean,
      default: false,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
    versionKey: false,
  }
);

subscriptionPackageSchema.statics.build = (attrs: SubscriptionPackageAttrs) => {
  return new SubscriptionPackages(attrs);
};

const SubscriptionPackages = mongoose.model<
  SubscriptionPackageDoc,
  SubscriptionPackageModel
>("Subscription-Package", subscriptionPackageSchema);

export {
  SubscriptionPackages,
  SubscriptionPackageModel,
  SubscriptionPackageDoc,
};
