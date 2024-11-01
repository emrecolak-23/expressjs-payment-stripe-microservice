"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyInfoUpdatedValidationSchema = exports.newCompanyRegisteredValidationSchema = exports.createSubscriptionEventValidationSchema = void 0;
exports.createSubscriptionEventValidationSchema = {
    type: "object",
    properties: {
        packageGroupId: { type: "string" },
        subscriptionId: { type: "string" },
        paidPrice: { type: "number" },
        customerId: { type: "number" },
    },
    required: ["subscriptionId", "paidPrice"],
    additionalProperties: false,
};
exports.newCompanyRegisteredValidationSchema = {
    type: "object",
    properties: {
        companyId: { type: "number" },
        companyName: { type: "string" },
        authorizedPersonName: { type: "string" },
        authorizedPersonSurname: { type: "string" },
        authorizedPersonEmail: { type: "string" },
    },
    required: [
        "companyId",
        "companyName",
        "authorizedPersonName",
        "authorizedPersonSurname",
        "authorizedPersonEmail",
    ],
    additionalProperties: false,
};
exports.companyInfoUpdatedValidationSchema = {
    type: "object",
    properties: {
        id: { type: "number" },
        name: { type: "string" },
    },
    required: ["id", "name"],
    additionalProperties: false,
};
