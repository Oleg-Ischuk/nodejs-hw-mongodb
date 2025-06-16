import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../services/auth.js';
import createHttpError from 'http-errors';

export const registerUserController = async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await registerUser({
    name,
    email,
    password,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: newUser,
  });
};

export const loginUserController = async (req, res) => {
  const { email, password } = req.body;

  const loginResult = await loginUser({
    email,
    password,
  });

  // Встановлюємо refresh token в cookies
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 днів в мілісекундах
  res.cookie('refreshToken', loginResult.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: loginResult.accessToken,
    },
  });
};

export const refreshUserSessionController = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token not provided');
  }

  const refreshResult = await refreshUserSession(refreshToken);

  // Встановлюємо новий refresh token в cookies
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 днів в мілісекундах
  res.cookie('refreshToken', refreshResult.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: refreshResult.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token not provided');
  }

  await logoutUser(refreshToken);

  res.clearCookie('refreshToken');

  res.status(204).end();
};
