import mongoose, { Document, Model } from "mongoose";

interface CompanyAttrs {
  companyId: number;
  companyName: string;
  authorizedPersonName: string;
  authorizedPersonSurname: string;
  authorizedPersonEmail: string;
}

interface CompanyModel extends Model<CompanyDoc> {
  build(attrs: CompanyAttrs): CompanyDoc;
}

interface CompanyDoc extends Document {
  companyId: number;
  companyName: string;
  authorizedPersonName: string;
  authorizedPersonSurname: string;
  authorizedPersonEmail: string;
  stripeId?: string;
}

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type: Number,
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyInfoStatus: {
      type: String,
      required: true,
      default: "NOT_ENTERED",
    },
    authorizedPersonName: {
      type: String,
      required: true,
    },
    authorizedPersonSurname: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: false,
    },
    authorizedPersonEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

companySchema.statics.build = (attrs: CompanyAttrs) => {
  return new Company(attrs);
};

const Company = mongoose.model<CompanyDoc, CompanyModel>(
  "Company",
  companySchema
);
export { Company, CompanyModel, CompanyDoc };
