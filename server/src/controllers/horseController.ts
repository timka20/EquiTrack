import { FastifyRequest, FastifyReply } from 'fastify';
import { horseService } from '../services/horseService.js';
import { HorseStatus, HorseGender, UserRole } from '../types/index.js';

export class HorseController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status, ownerId, trainerId, forSale } = request.query as any;
      const filters: any = {};

      if (status) filters.status = status;
      if (ownerId) filters.ownerId = parseInt(ownerId);
      if (trainerId) filters.trainerId = parseInt(trainerId);
      if (forSale === 'true') filters.forSale = true;

      const isGuest = !request.user || request.user.role === UserRole.GUEST;

      let horses = await horseService.findAll(filters);

      if (isGuest) {
        horses = horses.map(h => ({
          id: h.id,
          name: h.name,
          gender: h.gender,
          color: h.color,
          birthYear: h.birthYear,
          birthCountry: h.birthCountry,
          photos: h.photos,
          description: h.description,
          status: h.status,
          price: h.price,
          starts: (h as any).starts,
          wins: (h as any).wins,
          places: (h as any).places,
          ownerName: h.ownerName,
          stats: (h as any).stats
        })) as any;
      }

      return reply.send(horses);
    } catch (error) {
      console.error('Get horses error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const horse = await horseService.findById(parseInt(id));

      if (!horse) {
        return reply.status(404).send({ error: 'Horse not found' });
      }

      const isGuest = !request.user || request.user.role === UserRole.GUEST;

      if (isGuest) {
        return reply.send({
          id: horse.id,
          name: horse.name,
          gender: horse.gender,
          color: horse.color,
          birthYear: horse.birth_year,
          birthCountry: horse.birth_country,
          photos: horse.photos,
          description: horse.description,
          price: horse.price,
          status: horse.status,
          pedigree: horse.pedigree,
          stats: horse.stats,
          raceHistory: horse.raceHistory,
          owner: horse.owner,
          ownerName: horse.ownerName,
          ownerPhone: horse.owner?.phone || null,
          ownerId: horse.owner_id,
        });
      }

      return reply.send(horse);
    } catch (error) {
      console.error('Get horse error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, gender, color, birthYear, birthCountry, fatherId, motherId, status, photos, description, breederId, price } = request.body as {
        name: string;
        gender: HorseGender;
        color: string;
        birthYear: number;
        birthCountry: string;
        fatherId?: number;
        motherId?: number;
        status?: HorseStatus;
        photos?: string[];
        description?: string;
        breederId?: number;
        price?: number;
      };

      const ownerId = request.user?.id;

      const horse = await horseService.create({
        name,
        gender,
        color,
        birthYear,
        birthCountry,
        breederId: breederId || ownerId,
        ownerId,
        fatherId,
        motherId,
        status: status || HorseStatus.IN_TRAINING,
        photos: photos || [],
        description,
        price
      });

      return reply.status(201).send(horse);
    } catch (error) {
      console.error('Create horse error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      const horse = await horseService.update(parseInt(id), updateData);

      if (!horse) {
        return reply.status(404).send({ error: 'Horse not found' });
      }

      return reply.send(horse);
    } catch (error) {
      console.error('Update horse error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await horseService.delete(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({ error: 'Horse not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete horse error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getMyHorses(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const horses = await horseService.findAll({ ownerId: request.user.id });
      return reply.send(horses);
    } catch (error) {
      console.error('Get my horses error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getTrainerHorses(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const horses = await horseService.findAll({ trainerId: request.user.id });
      return reply.send(horses);
    } catch (error) {
      console.error('Get trainer horses error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getForSale(request: FastifyRequest, reply: FastifyReply) {
    try {
      const horses = await horseService.getForSale();

      const isGuest = !request.user || request.user.role === UserRole.GUEST;

      if (isGuest) {
        return reply.send(horses.map(h => ({
          id: h.id,
          name: h.name,
          gender: h.gender,
          color: h.color,
          birthYear: h.birth_year,
          birthCountry: h.birth_country,
          photos: h.photos,
          description: h.description,
          pedigree: h.pedigree,
          stats: h.stats
        })));
      }

      return reply.send(horses);
    } catch (error) {
      console.error('Get horses for sale error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getPedigree(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const pedigree = await horseService.getPedigree(parseInt(id));

      if (!pedigree) {
        return reply.status(404).send({ error: 'Horse not found' });
      }

      return reply.send(pedigree);
    } catch (error) {
      console.error('Get pedigree error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await horseService.getStats();
      return reply.send(stats);
    } catch (error) {
      console.error('Get horse stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async assignTrainer(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { trainerId } = request.body as { trainerId: number };

      const horse = await horseService.update(parseInt(id), { trainerId });

      if (!horse) {
        return reply.status(404).send({ error: 'Horse not found' });
      }

      return reply.send(horse);
    } catch (error) {
      console.error('Assign trainer error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const horseController = new HorseController();
