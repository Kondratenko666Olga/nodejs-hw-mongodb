import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().optional(),
  photo:Joi.string().optional(),
  isFavourite: Joi.boolean().optional(),
  contactType: Joi.string().min(3).max(20).required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).optional(),
  phoneNumber: Joi.string().min(3).max(20).optional(),
  email: Joi.string().email().optional(),
  photo:Joi.string(),
  isFavourite: Joi.boolean().optional(),
  contactType: Joi.string().min(3).max(20).optional(),
});
