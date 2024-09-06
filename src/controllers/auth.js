import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import {UserCollection} from '../models/user.js';
// import {SessionCollection} from "../models/session.js";
import {
  createSession,
  deleteSessionById,
  refreshUsersSession,
  requestResetEmail,
  resetPassword
} from '../services/auth.js';

import{ generateAuthUrl } from "../utils/googleOAuth2.js";

// Контролер для реєстрації
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Перевірка, чи вже існує користувач з таким email
    const existingUser = await UserCollection.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'Email in use');
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення нового користувача
    const newUser = await UserCollection.create({ name, email, password: hashedPassword });

    // Видалення пароля з відповіді
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// Контролер для логіну
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Перевірка існування користувача
    const user = await UserCollection.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid email or password');
    }

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid email or password');
    }

    // Видаляємо стару сесію, якщо вона існує
    await deleteSessionById(user._id);

    // Створюємо нову сесію для користувача
    const session = await createSession(user._id);

    // Встановлюємо refreshToken в cookies
    res.cookie('refreshToken', session.session.refreshToken, {
      httpOnly: true,
      maxAge: session.session.refreshTokenValidUntil - Date.now(), // Встановлюємо час життя cookie
    });

    //Встановлюємо sessionId
    res.cookie('sessionId', session.session._id, {
      httpOnly: true,
      maxAge: session.session.refreshTokenValidUntil - Date.now(),
    });

    // Відправляємо відповідь з новим accessToken
    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: {
        accessToken: session.session.accessToken,
      },
    });
  } catch (error) {
    next(error); // Передаємо помилку для подальшої обробки middleware
  }
};

// Контролер для оновлення сесії
export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies;

    // Перевірка, чи наявний рефреш токен
    if (!refreshToken) {
      throw createHttpError(401, 'Missing refresh token');
    }

    // Оновлення сесії користувача на основі рефреш токену
    const newSession = await refreshUsersSession( req.cookies );

    res.cookie('refreshToken', newSession.refreshToken, {
      httpOnly: true,
      maxAge: newSession.session.refreshTokenValidUntil - Date.now(),
    });

    //Встановлюємо sessionId
    res.cookie('sessionId', newSession.session._id, {
      httpOnly: true,
      maxAge: newSession.session.refreshTokenValidUntil - Date.now(),
    });

    res.status(200).json({
      status: 200,
      message: `Successfully refreshed a session!`,
      data: {
        accessToken: newSession.session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Контролер для логауту користувача
export const logout = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    // Видалення сесії користувача
    if (cookies) {
      await deleteSessionById(cookies.sessionId);
    }

    // Очистка cookie з рефреш токеном
    res.clearCookie('refreshToken');

    // Відправка відповіді зі статусом 204
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


//Контроллер для скидання пошти

export async function requestResetEmailController(req, res) {
  const { email } = req.body;

  await requestResetEmail(email);

  res.send({
    status: 200,
    message: 'Reset email was send successfully',
    data: {},
  });
}

//Контроллер для скидання паролю
export async function resetPasswordController(req, res) {
  const { password, token } = req.body;

  await resetPassword(password, token);

  res.send({
    status: 200,
    message: 'Password reset successfully',
    data: {},
  });
}

//Контроллер для запиту на отримання посилання на google autorization
export async function getOAuthURLController(req, res) {
  const url = generateAuthUrl();
  res.send({
    status: 200,
    message: 'Successfully get Google OAuth URL',
    data: { url },
  });
}