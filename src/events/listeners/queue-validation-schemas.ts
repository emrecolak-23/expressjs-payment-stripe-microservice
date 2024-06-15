export const createSubscriptionEventValidationSchema = {
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

export const newCompanyRegisteredValidationSchema = {
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

export const companyInfoUpdatedValidationSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
  },
  required: ["id", "name"],
  additionalProperties: false,
};
