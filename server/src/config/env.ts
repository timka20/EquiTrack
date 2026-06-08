export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '49375'),
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'equipulse',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:27435',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.mail.ru',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '465'),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'EquiTrack <noreply@example.com>',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'EquiTrack'
};
