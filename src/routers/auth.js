import express from 'express';
import {
    login,
    register,
    refreshSession,
    logout,
    resetPasswordController,
    requestResetEmailController,
    getOAuthURLController
} from '../controllers/auth.js';

import { validateBody } from '../middlewares/validateBody.js';

import {
    registerSchema,
    loginUserSchema,
    resetPasswordSchema,
    requestResetEmailSchema
} from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();
const jsonParser = express.json();

// Маршрут для реєстрації користувача
router.post('/register', validateBody(registerSchema), register);
// Маршрут для логіну користувача
router.post('/login', validateBody(loginUserSchema), login);
// Реєстрація маршруту для оновлення сесії
router.post('/refresh', refreshSession);
// Реєстрація маршруту для логауту
router.post('/logout', logout);
//Маршрут для скидання паролю
router.post('/send-reset-email', jsonParser, validateBody(requestResetEmailSchema), ctrlWrapper(requestResetEmailController));
router.post('/reset-password', jsonParser, validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));
//Маршрут для запиту на отримання посилання на google autorization
router.get('/get-oauth-url', ctrlWrapper(getOAuthURLController));


export default router;