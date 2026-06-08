import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService.js';
import { comparePassword } from '../utils/helpers.js';
import { env } from '../config/env.js';
import { UserRole } from '../types/index.js';

function validateName(name: string, allowHyphen: boolean = false): boolean {
  if (!name || name.length < 2) return false;
  if (allowHyphen) {
    return /^[A-Za-zА-Яа-яЁё]+(-[A-Za-zА-Яа-яЁё]+)?$/.test(name);
  }
  return /^[A-Za-zА-Яа-яЁё]+$/.test(name);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };

      if (!email || !password) {
        return reply.status(400).send({ error: 'Укажите email и пароль' });
      }

      const user = await userService.findByEmail(email);
      if (!user) {
        return reply.status(401).send({ error: 'Неверный email или пароль' });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return reply.status(401).send({ error: 'Неверный email или пароль' });
      }

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }, { expiresIn: env.JWT_EXPIRES_IN });

      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return reply.status(500).send({ error: 'Произошла ошибка при входе' });
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password, firstName, lastName, phone, role = UserRole.GUEST } = request.body as {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role?: UserRole;
      };

      if (!email || !password || !firstName || !lastName) {
        return reply.status(400).send({ error: 'Заполните все обязательные поля' });
      }

      if (!validateEmail(email)) {
        return reply.status(400).send({ error: 'Укажите корректный email' });
      }

      if (!validateName(firstName)) {
        return reply.status(400).send({ error: 'Имя может содержать только буквы' });
      }

      if (!validateName(lastName, true)) {
        return reply.status(400).send({ error: 'Фамилия может содержать только буквы и одно тире' });
      }

      if (phone && !validatePhone(phone)) {
        return reply.status(400).send({ error: 'Укажите корректный номер телефона' });
      }

      if (password.length < 6) {
        return reply.status(400).send({ error: 'Пароль должен быть не менее 6 символов' });
      }

      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return reply.status(409).send({ error: 'Пользователь с таким email уже зарегистрирован' });
      }

      if (phone) {
        const existingPhone = await userService.findByPhone(phone);
        if (existingPhone) {
          return reply.status(409).send({ error: 'Пользователь с таким телефоном уже зарегистрирован' });
        }
      }

      const user = await userService.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        avatarUrl: null,
        isActive: true
      });

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }, { expiresIn: env.JWT_EXPIRES_IN });

      return reply.status(201).send({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return reply.status(500).send({ error: error.message || 'Ошибка при регистрации' });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Не авторизован' });
      }

      const user = await userService.findById(request.user.id);
      if (!user) {
        return reply.status(404).send({ error: 'Пользователь не найден' });
      }

      return reply.send({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl
      });
    } catch (error) {
      console.error('Get user error:', error);
      return reply.status(500).send({ error: 'Ошибка при получении данных пользователя' });
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Не авторизован' });
      }

      const { firstName, lastName, phone, avatarUrl } = request.body as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string;
      };

      if (firstName && !validateName(firstName)) {
        return reply.status(400).send({ error: 'Имя может содержать только буквы' });
      }

      if (lastName && !validateName(lastName, true)) {
        return reply.status(400).send({ error: 'Фамилия может содержать только буквы и одно тире' });
      }

      if (phone && !validatePhone(phone)) {
        return reply.status(400).send({ error: 'Укажите корректный номер телефона' });
      }

      const user = await userService.update(request.user.id, {
        firstName,
        lastName,
        phone,
        avatarUrl
      });

      return reply.send(user);
    } catch (error) {
      console.error('Update profile error:', error);
      return reply.status(500).send({ error: 'Ошибка при обновлении профиля' });
    }
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = request.body as { email: string };
      if (!email || !validateEmail(email)) {
        return reply.status(400).send({ error: 'Укажите корректный email' });
      }

      const user = await userService.findByEmail(email);
      if (!user) {
        return reply.status(404).send({ error: 'Пользователь с таким email не найден' });
      }

      return reply.send({ success: true, message: 'Инструкции по восстановлению пароля отправлены на email' });
    } catch (error) {
      console.error('Forgot password error:', error);
      return reply.status(500).send({ error: 'Ошибка при восстановлении пароля' });
    }
  }
}

export const authController = new AuthController();
