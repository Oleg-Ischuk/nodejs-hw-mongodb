import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import crypto from 'crypto';

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

    // Створюємо нову сесію
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
