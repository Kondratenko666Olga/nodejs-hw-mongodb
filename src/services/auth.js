import { UserCollection } from "../models/user.js";
import { SessionCollection } from '../models/session.js';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import fs from 'node:fs';
import path from 'node:path';

import handlebars from 'handlebars';
import { sendMail } from "../utils/sendEmail.js";

import {env} from '../utils/env.js';

// Константи для часу життя токенів
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export const findUserByEmail = async (email) => {
  return UserCollection.findOne({ email });
};

export const createUser = async (userData) => {
  return UserCollection.create(userData);
};

// Створення нової сесії для користувача
export const createSession = async (userId) => {
  // Генеруємо access та refresh токени
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // Записуємо нову сесію в базу даних
  const session = await SessionCollection.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });

  return { session };
};

// Функція для видалення старої сесії за userId
export const deleteSessionById = async (id) => {
  await SessionCollection.deleteOne({ _id: id });
};

// Функція для оновлення сесії
export const refreshUsersSession = async (res) => {
  const session = await SessionCollection.findOne({refreshToken: res.refreshToken});

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = await createSession(session.userId);

  await SessionCollection.deleteOne({ _id: session._id });

  return newSession;
};

//Функція для скидання паролю
export async function resetPassword(password, token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    const user = await UserCollection.findOne({ _id: decoded.sub, email: decoded.email });

    if (user === null) {
      throw createHttpError(404, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 120);

    await UserCollection.findOneAndUpdate(
      { _id: user._id },
      { password: hashedPassword },
    );
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      throw createHttpError(401, 'Token error');
    }

    throw error;
  }
}

// Функція для скидання пошти
export async function requestResetEmail(email) {
  const user = await UserCollection.findOne({ email });

  if (user === null) {
    throw createHttpError(404, 'User not found');
  }

const secretPass = env('JWT_SECRET');

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    secretPass,
    { expiresIn: '15m' },
  );

  const templateSource = fs.readFileSync(
    path.resolve('src/templates/reset-password.hbs'),
    { encoding: 'UTF-8' },
  );
  const template = handlebars.compile(templateSource);

  const html = template({ name: user.name, resetToken });
  const fromEmail = env('SMTP_FROM_EMAIL');

  try {
    await sendMail({
      from: fromEmail,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (e) {
    console.log(e);
    throw createHttpError(500, 'Cannot send email');
  }
}