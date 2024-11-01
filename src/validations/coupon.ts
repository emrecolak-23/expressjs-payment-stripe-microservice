import Joi from "joi";

const createCoupon = Joi.object({
  authorizationName: Joi.string().length(4).required(),
  discount: Joi.number().required(),
  expirationDate: Joi.date().required(),
  isSubs: Joi.boolean().required(),
  trialDuration: Joi.number().optional(),
  isOnlyForOneCompany: Joi.boolean().required(),
});

export { createCoupon };
