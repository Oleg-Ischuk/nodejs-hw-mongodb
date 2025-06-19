import { User, Session, Contact } from '../db/models/index.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Auth Services
export const registerUser = async (userData) => {
  try {
    const { name, email, password } = userData;

    // Перевіряємо, чи існує користувач з такою поштою
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'Email in use');
    }

    // Хешуємо пароль
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Створюємо нового користувача
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Повертаємо користувача без пароля
    const userWithoutPassword = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return userWithoutPassword;
  } catch (error) {
    console.error('Error in registerUser service:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const { email, password } = credentials;

    // Знаходимо користувача за email
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Unauthorized');
    }

    // Перевіряємо пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Unauthorized');
    }

    // Видаляємо стару сесію користувача, якщо вона існує
    await Session.deleteMany({ userId: user._id });

    // Генеруємо токени
    const accessToken = crypto.randomBytes(30).toString('base64');
    const refreshToken = crypto.randomBytes(30).toString('base64');

    // Встановлюємо час життя токенів
    const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 хвилин
    const refreshTokenValidUntil = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 днів

    await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Error in loginUser service:', error);
    throw error;
  }
};

export const refreshUserSession = async (refreshToken) => {
  try {
    // Знаходимо сесію за refresh токеном
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    // Перевіряємо, чи не прострочений refresh токен
    if (new Date() > session.refreshTokenValidUntil) {
      throw createHttpError(401, 'Session token expired');
    }

    // Знаходимо користувача
    const user = await User.findById(session.userId);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }

    // Видаляємо стару сесію
    await Session.deleteOne({ _id: session._id });

    // Генеруємо нові токени
    const newAccessToken = crypto.randomBytes(30).toString('base64');
    const newRefreshToken = crypto.randomBytes(30).toString('base64');

    // Встановлюємо час життя токенів
    const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 хвилин
    const refreshTokenValidUntil = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 днів

    await Session.create({
      userId: user._id,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Error in refreshUserSession service:', error);
    throw error;
  }
};

export const logoutUser = async (refreshToken) => {
  try {
    const session = await Session.findOneAndDelete({ refreshToken });

    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in logoutUser service:', error);
    throw error;
  }
};

export const sendResetEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '5m', // 5 хвилин
    });

    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD);
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Please click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 5 minutes.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
    }
  } catch (error) {
    console.error('Error in sendResetEmail service:', error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      throw createHttpError(
        401,
        `Token is expired or invalid: ${jwtError.message}`,
      );
    }

    const { email } = decodedToken;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    await Session.deleteMany({ userId: user._id });

    return { success: true };
  } catch (error) {
    console.error('Error in resetPassword service:', error);
    throw error;
  }
};

// Contact Services
export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
  userId,
} = {}) => {
  try {
    const skip = (page - 1) * perPage;

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObject = { [sortBy]: sortDirection };
    const searchFilter = { ...filter, userId };

    const contacts = await Contact.find(searchFilter)
      .sort(sortObject)
      .skip(skip)
      .limit(perPage);

    const totalItems = await Contact.countDocuments(searchFilter);

    const totalPages = Math.ceil(totalItems / perPage);

    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      data: contacts,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getContactsById = async (contactId, userId) => {
  try {
    const contact = await Contact.findOne({ _id: contactId, userId });
    return contact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createContact = async (contactData) => {
  try {
    const newContact = await Contact.create(contactData);
    return newContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateContact = async (contactId, updateData, userId) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId },
      updateData,
      { new: true },
    );
    return updatedContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteContact = async (contactId, userId) => {
  try {
    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      userId,
    });
    return deletedContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
