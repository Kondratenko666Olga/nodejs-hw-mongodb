import nodemailer from 'nodemailer';
import {env} from '../utils/env.js';

const transport = nodemailer.createTransport({
  host: env('SMTP_HOST'),
  port: env('SMTP_PORT'),
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env('SMTP_USER'),
    pass: env('SMTP_PASSWORD'),
  },
});

export function sendMail(message) {
  return transport.sendMail(message);
}