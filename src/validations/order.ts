import Joi from "joi";

const createOrderValidation = Joi.object({
  cartId: Joi.string(),
  packages: Joi.array().items(),
});

export { createOrderValidation };
