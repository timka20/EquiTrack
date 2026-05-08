import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService.js';
import { comparePassword } from '../utils/helpers.js';
import { env } from '../config/env.js';
import { UserRole } from '../types/index.js';

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password are required' });
      }

      const user = await userService.findByEmail(email);

      const isValidPassword = await comparePassword(password, user.password);

      if (!isValidPassword) {
        return reply.status(401).send({ error: 'Введен не верный пароль.', e: `${email} - ${password} || ${user.email} - ${user.password} - ${isValidPassword}` });
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
      return reply.status(500).send({ error: 'Произошла ошибка' });
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
        return reply.status(400).send({ error: 'All required fields must be provided' });
      }

      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return reply.status(409).send({ error: 'Email already registered' });
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
    } catch (error) {
      console.error('Registration error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const user = await userService.findById(request.user.id);

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
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
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { firstName, lastName, phone, avatarUrl } = request.body as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string;
      };

      const user = await userService.update(request.user.id, {
        firstName,
        lastName,
        phone,
        avatarUrl
      });

      return reply.send(user);
    } catch (error) {
      console.error('Update profile error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
