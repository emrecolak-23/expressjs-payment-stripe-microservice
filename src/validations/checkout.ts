import Joi from "joi";

const createCheckoutValidation = Joi.object({
  orderId: Joi.string().required(),
});

export { createCheckoutValidation };
