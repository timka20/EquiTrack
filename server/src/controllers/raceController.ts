import { FastifyRequest, FastifyReply } from 'fastify';
import { raceService } from '../services/raceService.js';
import { RaceStatus, RegistrationStatus, UserRole } from '../types/index.js';

const MAX_PRIZE_FUND = 10_000_000;

function validateRaceData(data: any, isUpdate: boolean = false): { valid: boolean; error?: string } {
  if (!isUpdate || data.date !== undefined) {
    const date = new Date(data.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date < now) {
      return { valid: false, error: 'Дата скачки не может быть в прошлом' };
    }
  }
  if (!isUpdate || data.prizeFund !== undefined) {
    const prize = Number(data.prizeFund);
    if (isNaN(prize) || prize < 0) {
      return { valid: false, error: 'Призовой фонд не может быть отрицательным' };
    }
    if (prize > MAX_PRIZE_FUND) {
      return { valid: false, error: 'Призовой фонд не может превышать 10 000 000 ₽' };
    }
  }
  return { valid: true };
}

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
      return reply.status(500).send({ error: 'Ошибка при получении скачек' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const race = await raceService.findById(parseInt(id));

      if (!race) {
        return reply.status(404).send({ error: 'Скачка не найдена' });
      }

      return reply.send(race);
    } catch (error) {
      console.error('Get race error:', error);
      return reply.status(500).send({ error: 'Ошибка при получении скачки' });
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

      const validation = validateRaceData(request.body);
      if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
      }

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
      return reply.status(500).send({ error: 'Ошибка при создании скачки' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      if (updateData.date || updateData.prizeFund !== undefined) {
        const validation = validateRaceData(updateData, true);
        if (!validation.valid) {
          return reply.status(400).send({ error: validation.error });
        }
      }

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const race = await raceService.update(parseInt(id), updateData);

      if (!race) {
        return reply.status(404).send({ error: 'Скачка не найдена' });
      }

      return reply.send(race);
    } catch (error) {
      console.error('Update race error:', error);
      return reply.status(500).send({ error: 'Ошибка при обновлении скачки' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await raceService.delete(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({ error: 'Скачка не найдена' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete race error:', error);
      return reply.status(500).send({ error: 'Ошибка при удалении скачки' });
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
        return reply.status(401).send({ error: 'Не авторизован' });
      }

      if (!horseId) {
        return reply.status(400).send({ error: 'Необходимо выбрать лошадь' });
      }

      const registration = await raceService.register(parseInt(id), {
        horseId: Number(horseId),
        ownerId: request.user.id,
        trainerId: trainerId ? Number(trainerId) : undefined,
        jockeyId: jockeyId ? Number(jockeyId) : undefined
      });

      return reply.status(201).send(registration);
    } catch (error) {
      console.error('Register for race error:', error);
      return reply.status(500).send({ error: 'Ошибка при регистрации на скачку' });
    }
  }

  async updateRegistrationStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { registrationId } = request.params as { registrationId: string };
      const { status } = request.body as { status: RegistrationStatus };

      const updated = await raceService.updateRegistrationStatus(parseInt(registrationId), status);

      if (!updated) {
        return reply.status(404).send({ error: 'Заявка не найдена' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Update registration status error:', error);
      return reply.status(500).send({ error: 'Ошибка при обновлении статуса заявки' });
    }
  }

  async addResults(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { results } = request.body as { results: Array<{ horseId: number; position: number; time?: string; prize?: number; notes?: string }> };

      const added = await raceService.addResults(parseInt(id), results);

      if (!added) {
        return reply.status(400).send({ error: 'Не удалось добавить результаты' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Add results error:', error);
      return reply.status(500).send({ error: 'Ошибка при добавлении результатов' });
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
      return reply.status(500).send({ error: 'Ошибка при получении календаря' });
    }
  }

  async getMyRegistrations(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Не авторизован' });
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

      if (role === UserRole.OWNER_PRIVATE || role === UserRole.OWNER_STUD || role === UserRole.ADMIN) {
        query += 'rr.owner_id = ?';
      } else if (role === UserRole.TRAINER) {
        query += 'rr.trainer_id = ?';
      } else if (role === UserRole.JOCKEY) {
        query += 'rr.jockey_id = ?';
      } else {
        return reply.status(403).send({ error: 'Нет доступа' });
      }

      query += ' ORDER BY r.date DESC';

      const rows = (await import('../config/database.js')).db.prepare(query).all(request.user.id);
      return reply.send(rows);
    } catch (error) {
      console.error('Get my registrations error:', error);
      return reply.status(500).send({ error: 'Ошибка при получении заявок' });
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await raceService.getStats();
      return reply.send(stats);
    } catch (error) {
      console.error('Get race stats error:', error);
      return reply.status(500).send({ error: 'Ошибка при получении статистики' });
    }
  }
}

export const raceController = new RaceController();
