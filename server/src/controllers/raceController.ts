import { FastifyRequest, FastifyReply } from 'fastify';
import { raceService } from '../services/raceService.js';
import { RaceStatus, RegistrationStatus, UserRole } from '../types/index.js';

export class RaceController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status, upcoming, past } = request.query as any;
      const filters: any = {};

      if (status) filters.status = status;
      if (upcoming === 'true') filters.upcoming = true;
      if (past === 'true') filters.past = true;

      const races = await raceService.findAll(filters);
      return reply.send(races);
    } catch (error) {
      console.error('Get races error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const race = await raceService.findById(parseInt(id));

      if (!race) {
        return reply.status(404).send({ error: 'Race not found' });
      }

      return reply.send(race);
    } catch (error) {
      console.error('Get race error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, date, hippodrome, distance, prizeFund, status, description } = request.body as {
        name: string;
        date: string;
        hippodrome: string;
        distance: number;
        prizeFund: number;
        status?: RaceStatus;
        description?: string;
      };

      const race = await raceService.create({
        name,
        date: new Date(date),
        hippodrome,
        distance,
        prizeFund,
        status: status || RaceStatus.SCHEDULED,
        description
      });

      return reply.status(201).send(race);
    } catch (error) {
      console.error('Create race error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const race = await raceService.update(parseInt(id), updateData);

      if (!race) {
        return reply.status(404).send({ error: 'Race not found' });
      }

      return reply.send(race);
    } catch (error) {
      console.error('Update race error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await raceService.delete(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({ error: 'Race not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete race error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { horseId, trainerId, jockeyId } = request.body as {
        horseId: number;
        trainerId?: number;
        jockeyId?: number;
      };

      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const registration = await raceService.register(parseInt(id), {
        horseId,
        ownerId: request.user.id,
        trainerId,
        jockeyId
      });

      return reply.status(201).send(registration);
    } catch (error) {
      console.error('Register for race error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateRegistrationStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { registrationId } = request.params as { registrationId: string };
      const { status } = request.body as { status: RegistrationStatus };

      const updated = await raceService.updateRegistrationStatus(parseInt(registrationId), status);

      if (!updated) {
        return reply.status(404).send({ error: 'Registration not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Update registration status error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async addResults(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { results } = request.body as { results: Array<{ horseId: number; position: number; time?: string; prize?: number; notes?: string }> };

      const added = await raceService.addResults(parseInt(id), results);

      if (!added) {
        return reply.status(400).send({ error: 'Failed to add results' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Add results error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getCalendar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { year, month } = request.query as { year: string; month: string };

      const races = await raceService.getCalendar(
        parseInt(year) || new Date().getFullYear(),
        parseInt(month) || new Date().getMonth() + 1
      );

      return reply.send(races);
    } catch (error) {
      console.error('Get calendar error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getMyRegistrations(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const role = request.user.role;
      let query = `
        SELECT rr.*, r.name as race_name, r.date as race_date, r.hippodrome,
          h.name as horse_name, h.color as horse_color
        FROM race_registrations rr
        JOIN races r ON rr.race_id = r.id
        JOIN horses h ON rr.horse_id = h.id
        WHERE 
      `;

      if (role === UserRole.OWNER_PRIVATE || role === UserRole.OWNER_STUD) {
        query += 'rr.owner_id = ?';
      } else if (role === UserRole.TRAINER) {
        query += 'rr.trainer_id = ?';
      } else if (role === UserRole.JOCKEY) {
        query += 'rr.jockey_id = ?';
      } else {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      query += ' ORDER BY r.date DESC';

      const rows = (await import('../config/database.js')).db.prepare(query).all(request.user.id);
      return reply.send(rows);
    } catch (error) {
      console.error('Get my registrations error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await raceService.getStats();
      return reply.send(stats);
    } catch (error) {
      console.error('Get race stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const raceController = new RaceController();
