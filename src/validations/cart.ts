import Joi from "joi";

const addToCartValidation = Joi.object({
  packageGroupId: Joi.string().required(),
  numberOfSeats: Joi.number(),
  durationType: Joi.number().equal(1),
});

const updateCartValidation = Joi.object({
  numberOfSeats: Joi.number().required(),
});

export { addToCartValidation, updateCartValidation };
