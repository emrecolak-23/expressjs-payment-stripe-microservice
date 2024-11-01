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
exports.SubscriptionPackages = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const subscriptionPackageSchema = new mongoose_1.Schema({
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
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        },
    },
    timestamps: true,
    versionKey: false,
});
subscriptionPackageSchema.statics.build = (attrs) => {
    return new SubscriptionPackages(attrs);
};
const SubscriptionPackages = mongoose_1.default.model("Subscription-Package", subscriptionPackageSchema);
exports.SubscriptionPackages = SubscriptionPackages;
