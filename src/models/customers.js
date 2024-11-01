"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const companySchema = new mongoose_1.default.Schema({
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
}, { timestamps: true, versionKey: false });
companySchema.statics.build = (attrs) => {
    return new Company(attrs);
};
const Company = mongoose_1.default.model("Company", companySchema);
exports.Company = Company;
