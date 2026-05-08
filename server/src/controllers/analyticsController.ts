import { FastifyRequest, FastifyReply } from 'fastify';
import { analyticsService } from '../services/analyticsService.js';
import { UserRole } from '../types/index.js';

export class AnalyticsController {
  async getOwnerAnalytics(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      if (request.user.role !== UserRole.OWNER_PRIVATE && request.user.role !== UserRole.OWNER_STUD) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      const analytics = await analyticsService.getOwnerAnalytics(request.user.id);
      return reply.send(analytics);
    } catch (error) {
      console.error('Get owner analytics error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getTrainerAnalytics(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      if (request.user.role !== UserRole.TRAINER) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      const analytics = await analyticsService.getTrainerAnalytics(request.user.id);
      return reply.send(analytics);
    } catch (error) {
      console.error('Get trainer analytics error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getJockeyAnalytics(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      if (request.user.role !== UserRole.JOCKEY) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      const analytics = await analyticsService.getJockeyAnalytics(request.user.id);
      return reply.send(analytics);
    } catch (error) {
      console.error('Get jockey analytics error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getAdminAnalytics(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      if (request.user.role !== UserRole.ADMIN) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      const analytics = await analyticsService.getAdminAnalytics();
      return reply.send(analytics);
    } catch (error) {
      console.error('Get admin analytics error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const stats = await analyticsService.getDashboardStats(request.user.id, request.user.role);
      return reply.send(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getMyAnalytics(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      let analytics;
      switch (request.user.role) {
        case UserRole.OWNER_PRIVATE:
        case UserRole.OWNER_STUD:
          analytics = await analyticsService.getOwnerAnalytics(request.user.id);
          break;
        case UserRole.TRAINER:
          analytics = await analyticsService.getTrainerAnalytics(request.user.id);
          break;
        case UserRole.JOCKEY:
          analytics = await analyticsService.getJockeyAnalytics(request.user.id);
          break;
        case UserRole.ADMIN:
          analytics = await analyticsService.getAdminAnalytics();
          break;
        default:
          analytics = { message: 'No analytics available for your role' };
      }

      return reply.send(analytics);
    } catch (error) {
      console.error('Get my analytics error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const analyticsController = new AnalyticsController();
