import Joi from 'joi';

// Auth schemas
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.min': 'Name must be at least 3 characters long',
    'string.max': 'Name must not exceed 30 characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Contact schemas
export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Name must be at least 3 characters long',
    'string.max': 'Name must not exceed 20 characters',
    'any.required': 'Name is required',
  }),

  phoneNumber: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Phone number must be at least 3 characters long',
    'string.max': 'Phone number must not exceed 20 characters',
    'any.required': 'Phone number is required',
  }),

  email: Joi.string().email().min(3).max(20).optional().messages({
    'string.email': 'Email must be a valid email address',
    'string.min': 'Email must be at least 3 characters long',
    'string.max': 'Email must not exceed 20 characters',
  }),

  isFavourite: Joi.boolean().optional(),

  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'any.only': 'Contact type must be one of: work, home, personal',
      'any.required': 'Contact type is required',
    }),
  photo: Joi.string().optional(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).optional().messages({
    'string.min': 'Name must be at least 3 characters long',
    'string.max': 'Name must not exceed 20 characters',
  }),

  phoneNumber: Joi.string().min(3).max(20).optional().messages({
    'string.min': 'Phone number must be at least 3 characters long',
    'string.max': 'Phone number must not exceed 20 characters',
  }),

  email: Joi.string().email().min(3).max(20).optional().messages({
    'string.email': 'Email must be a valid email address',
    'string.min': 'Email must be at least 3 characters long',
    'string.max': 'Email must not exceed 20 characters',
  }),

  isFavourite: Joi.boolean().optional(),

  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .optional()
    .messages({
      'any.only': 'Contact type must be one of: work, home, personal',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

// Email Schemas
export const sendResetEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});
