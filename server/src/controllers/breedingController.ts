import { FastifyRequest, FastifyReply } from 'fastify';
import { breedingService } from '../services/breedingService.js';
import { BreedingStatus, FoalStatus } from '../types/index.js';

export class BreedingController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status, mareId, stallionId } = request.query as any;
      const filters: any = {};

      if (status) filters.status = status;
      if (mareId) filters.mareId = parseInt(mareId);
      if (stallionId) filters.stallionId = parseInt(stallionId);

      const breedings = await breedingService.findAll(filters);
      return reply.send(breedings);
    } catch (error) {
      console.error('Get breedings error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const breeding = await breedingService.findById(parseInt(id));

      if (!breeding) {
        return reply.status(404).send({ error: 'Breeding not found' });
      }

      return reply.send(breeding);
    } catch (error) {
      console.error('Get breeding error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { mareId, stallionId, plannedDate, notes } = request.body as {
        mareId: number;
        stallionId: number;
        plannedDate: string;
        notes?: string;
      };

      const breeding = await breedingService.create({
        mareId,
        stallionId,
        plannedDate: new Date(plannedDate),
        status: BreedingStatus.PLANNED,
        notes
      });

      return reply.status(201).send(breeding);
    } catch (error) {
      console.error('Create breeding error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      if (updateData.plannedDate) updateData.plannedDate = new Date(updateData.plannedDate);
      if (updateData.actualDate) updateData.actualDate = new Date(updateData.actualDate);
      if (updateData.expectedFoalingDate) updateData.expectedFoalingDate = new Date(updateData.expectedFoalingDate);

      const breeding = await breedingService.update(parseInt(id), updateData);

      if (!breeding) {
        return reply.status(404).send({ error: 'Breeding not found' });
      }

      return reply.send(breeding);
    } catch (error) {
      console.error('Update breeding error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await breedingService.delete(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({ error: 'Breeding not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete breeding error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async addFoal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { horseId, status, price, notes } = request.body as {
        horseId: number;
        status?: FoalStatus;
        price?: number;
        notes?: string;
      };

      const foal = await breedingService.addFoal(parseInt(id), {
        horseId,
        status,
        price,
        notes
      });

      return reply.status(201).send(foal);
    } catch (error) {
      console.error('Add foal error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateFoalStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { foalId } = request.params as { foalId: string };
      const { status, price, buyerId } = request.body as {
        status: FoalStatus;
        price?: number;
        buyerId?: number;
      };

      const updated = await breedingService.updateFoalStatus(parseInt(foalId), status, { price, buyerId });

      if (!updated) {
        return reply.status(404).send({ error: 'Foal not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Update foal status error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getFoals(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status, ownerId } = request.query as any;
      const filters: any = {};

      if (status) filters.status = status;
      if (ownerId) filters.ownerId = parseInt(ownerId);

      const foals = await breedingService.getFoals(filters);
      return reply.send(foals);
    } catch (error) {
      console.error('Get foals error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await breedingService.getStats();
      return reply.send(stats);
    } catch (error) {
      console.error('Get breeding stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async predictPrice(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const prediction = await breedingService.getPredictedPrice(parseInt(id));
      return reply.send(prediction);
    } catch (error) {
      console.error('Predict price error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getMyBreedings(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { db } = await import('../config/database.js');
      const horses = db.prepare('SELECT id FROM horses WHERE owner_id = ?').all(request.user.id);

      const horseIds = (horses as any[]).map(h => h.id);

      if (horseIds.length === 0) {
        return reply.send([]);
      }

      const breedings = db.prepare(`
        SELECT b.*, 
          m.name as mare_name, m.owner_id as mare_owner_id,
          s.name as stallion_name, s.owner_id as stallion_owner_id
        FROM breedings b
        JOIN horses m ON b.mare_id = m.id
        JOIN horses s ON b.stallion_id = s.id
        WHERE m.owner_id = ? OR s.owner_id = ?
        ORDER BY b.planned_date DESC
      `).all(request.user.id, request.user.id);

      return reply.send(breedings);
    } catch (error) {
      console.error('Get my breedings error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const breedingController = new BreedingController();
