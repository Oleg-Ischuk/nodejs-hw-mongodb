import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          // Базова валідація email
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
  },
  {
    versionKey: false,
    timestamps: true, // Автоматично додає createdAt та updatedAt
  },
);

// Contact Schema
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
    photo: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'User ID is required'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Session Schema
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'User ID is required'],
    },
    accessToken: {
      type: String,
      required: [true, 'Access token is required'],
    },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
    },
    accessTokenValidUntil: {
      type: Date,
      required: [true, 'Access token expiration date is required'],
    },
    refreshTokenValidUntil: {
      type: Date,
      required: [true, 'Refresh token expiration date is required'],
    },
  },
  {
    versionKey: false,
    timestamps: true, // Автоматично додає createdAt та updatedAt
  },
);

// Індекси
contactSchema.index({ userId: 1 });

sessionSchema.index({ userId: 1 });
sessionSchema.index({ accessToken: 1 });
sessionSchema.index({ refreshToken: 1 });

// Індекс для автоматичного видалення застарілих сесій (TTL index)
sessionSchema.index({ refreshTokenValidUntil: 1 }, { expireAfterSeconds: 0 });

// Експорт моделей
export const User = mongoose.model('users', userSchema);
export const Contact = mongoose.model('contacts', contactSchema);
export const Session = mongoose.model('sessions', sessionSchema);
