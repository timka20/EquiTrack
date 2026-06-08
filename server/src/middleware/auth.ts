import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../types/index.js';

export const authenticate = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        reply.status(401).send({ error: 'Authentication required' });
        throw new Error('Authentication required');
      }

      const decoded = fastify.jwt.verify(token) as {
        id: number;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
      };
      request.user = decoded;
    } catch (err: any) {
      if (err?.message === 'Authentication required') throw err;
      reply.status(401).send({ error: 'Invalid token' });
      throw new Error('Invalid token');
    }
  });
});

export const requireRole = (...roles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

  };
};

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.user) {
    return reply.status(401).send({ error: 'Authentication required' });
  }
};
