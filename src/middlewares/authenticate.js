import createHttpError from 'http-errors';
import { Session, User } from '../db/models/index.js';

const authenticate = async (req, res, next) => {
  try {
    // Отримуємо заголовок Authorization
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw createHttpError(401, 'Please provide Authorization header');
    }

    // Перевіряємо формат Bearer token
    const bearer = authHeader.split(' ');

    if (bearer.length !== 2 || bearer[0] !== 'Bearer') {
      throw createHttpError(401, 'Auth header should be of type Bearer');
    }

    const accessToken = bearer[1];

    // Знаходимо сесію за access токеном
    const session = await Session.findOne({ accessToken });

    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    // Перевіряємо, чи не протермінований access токен
    if (new Date() > session.accessTokenValidUntil) {
      throw createHttpError(401, 'Access token expired');
    }

    // Знаходимо користувача за ID з сесії
    const user = await User.findById(session.userId);

    if (!user) {
      throw createHttpError(401, 'Session not found');
    }

    // Додаємо користувача до req (без пароля)
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
