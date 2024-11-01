"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponUsage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const couponUsageSchema = new mongoose_1.Schema({
    userId: {
        type: Number,
        required: true,
    },
    cartId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
    },
    couponId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Coupon",
        required: true,
    },
    packageId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Package",
            required: false,
        },
    ],
    isUsed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform(doc, ret) {
            delete ret.createdAt;
            delete ret.updatedAt;
        },
    },
});
couponUsageSchema.statics.build = (attrs) => {
    return new CouponUsage(attrs);
};
const CouponUsage = mongoose_1.default.model("CouponUsage", couponUsageSchema);
exports.CouponUsage = CouponUsage;
