import Joi from "joi";

export const registerValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]+$/).required(),
  password: Joi.string().min(8).required()
});

export const verifyValidation = Joi.object({
  verificationCode: Joi.string().length(6).required()
});


export const loginValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  
  export const forgotPasswordValidation = Joi.object({
    email: Joi.string().email().required()
  });
  
  export const resetPasswordValidation = Joi.object({
    email: Joi.string().email().required(),
    resetCode: Joi.string().length(6).required(),
    newPassword: Joi.string().min(8).required()
  });