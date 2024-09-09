import path from 'node:path';


export const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc',
  };

  export const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds;
  export const REFRESH_TOKEN_TTL = 24 * 60 * 60 * 1000; // 1 day in milliseconds;

  export const SMTP = {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    USER: process.env.SMTP_USER,
    PASSWORD: process.env.SMTP_PASSWORD,
    FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  };

  export const TPS = {
    DOMAIN: process.env.APP_DOMAIN,
  };

  export const CLOUDINARY = {
    NAME: process.env.CLOUDINARY_CLOUD_NAME,
    KEY: process.env.CLOUDINARY_API_KEY,
    SECRET: process.env.CLOUDINARY_API_SECRET,
    EMALABLE: process.env.ENABLE_CLOUDINARY,
  };

  export const UPLOAD_DIR = path.resolve('src', 'uploads');