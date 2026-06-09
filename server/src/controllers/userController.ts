import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService.js';
import { UserRole } from '../types/index.js';

function mapUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    role: row.role,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

export class UserController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.findAll();
      return reply.send(users.map(mapUser));
    } catch (error) {
      console.error('Get users error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = await userService.findById(parseInt(id));

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send(mapUser(user));
    } catch (error) {
      console.error('Get user error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password, firstName, lastName, phone, role, avatarUrl } = request.body as {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role: UserRole;
        avatarUrl?: string;
      };

      const user = await userService.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        avatarUrl: avatarUrl || null,
        isActive: true
      });

      return reply.status(201).send(mapUser(user));
    } catch (error) {
      console.error('Create user error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { firstName, lastName, phone, role, avatarUrl, isActive } = request.body as {
        firstName?: string;
        lastName?: string;
        phone?: string;
        role?: UserRole;
        avatarUrl?: string;
        isActive?: boolean;
      };

      const user = await userService.update(parseInt(id), {
        firstName,
        lastName,
        phone,
        role,
        avatarUrl,
        isActive
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send(mapUser(user));
    } catch (error) {
      console.error('Update user error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await userService.delete(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete user error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getTrainers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const trainers = await userService.getTrainers();
      return reply.send(trainers.map(mapUser));
    } catch (error) {
      console.error('Get trainers error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getJockeys(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jockeys = await userService.getJockeys();
      return reply.send(jockeys.map(mapUser));
    } catch (error) {
      console.error('Get jockeys error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getVeterinarians(request: FastifyRequest, reply: FastifyReply) {
    try {
      const vets = await userService.getVeterinarians();
      return reply.send(vets.map(mapUser));
    } catch (error) {
      console.error('Get veterinarians error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await userService.getStats();
      return reply.send(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const userController = new UserController();
