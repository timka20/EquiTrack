import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; password: string; error?: string }> {
  try {
    const newPassword = generatePassword(8);

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const svgPath = resolve(__dirname, '../../../Cover.svg');
    let svgContent = readFileSync(svgPath, 'utf-8');
    svgContent = svgContent.replace('&lt;новый_пароль&gt;', newPassword);

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Восстановление пароля — EquiTrack',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="https://upload.timka20.ru/files/04119093b608.png" alt="Новый пароль" style="width: 100%; height: auto; display: block;" />
          <p style="font-size: 16px; color: #333333; line-height: 1.6;">
            Ваш новый пароль от аккаунта: <strong style="font-size: 18px;">${newPassword}</strong>
          </p>
          <p style="font-size: 14px; color: #666666; margin-top: 30px;">
            С уважением,<br>
            конный портал EquiTrack
          </p>
        </div>
      `,
    });

    return { success: true, password: newPassword };
  } catch (error: any) {
    console.error('Send password reset email error:', error);
    return { success: false, password: '', error: error.message || 'Ошибка отправки email' };
  }
}