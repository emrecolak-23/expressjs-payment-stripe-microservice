import mongoose, { Schema, Model, Document, mongo } from "mongoose";

export interface PaymentsMethodAttrs {
    customerId: number,
    binNumber: number,
    cardAssociation: string,
    cardHolderName: string,
    lastFourDigits: string,
    isActive: boolean,
    orderId?: string,
}

export interface PaymentsMethodDoc extends Document {
    customerId: number,
    binNumber: number,
    cardAssociation: string,
    cardHolderName: string,
    lastFourDigits: string,
    orderId?: string,
}

interface PaymentsMethodModel extends Model<PaymentsMethodDoc> {
    build(attrs: PaymentsMethodAttrs): PaymentsMethodDoc;
}

const paymentsMethodSchema = new Schema({
    customerId: { type: Number, required: true },
    binNumber: { type: Number, required: true },
    cardAssociation: { type: String, required: true },
    cardHolderName: { type: String, required: true },
    lastFourDigits: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orders'}
}, {
    timestamps: true,
    versionKey: false,
});


paymentsMethodSchema.statics.build = (attrs: PaymentsMethodAttrs) => {
    return new PaymentsMethod(attrs);
};

const PaymentsMethod = mongoose.model<PaymentsMethodDoc, PaymentsMethodModel>("Payments-Method", paymentsMethodSchema);

export { PaymentsMethod, PaymentsMethodModel }
