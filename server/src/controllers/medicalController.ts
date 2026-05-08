import { FastifyRequest, FastifyReply } from 'fastify';
import { medicalService } from '../services/medicalService.js';

export class MedicalController {
  async getMedicalRecords(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId } = request.params as { horseId: string };
      const records = await medicalService.getMedicalRecords(parseInt(horseId));
      return reply.send(records);
    } catch (error) {
      console.error('Get medical records error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async createMedicalRecord(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId } = request.params as { horseId: string };
      const { date, record_type, description, diagnosis, treatment, restrictions, medications } = request.body as {
        date: string;
        record_type?: string;
        description: string;
        diagnosis?: string;
        treatment?: string;
        restrictions?: string;
        medications?: string;
      };

      if (!date || !description) {
        return reply.status(400).send({ error: 'Missing required fields: date, description' });
      }

      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const record = await medicalService.createMedicalRecord({
        horseId: parseInt(horseId),
        veterinarianId: request.user.id,
        date: date,
        record_type: record_type || 'routine',
        description,
        diagnosis,
        treatment,
        restrictions,
        medications
      });

      return reply.status(201).send(record);
    } catch (error) {
      console.error('Create medical record error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateMedicalRecord(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { record_type, description, diagnosis, treatment, medications, restrictions, status } = request.body as any;

      const updated = await medicalService.updateMedicalRecord(parseInt(id), {
        record_type,
        description,
        diagnosis,
        treatment,
        medications,
        restrictions,
        status
      });

      if (!updated) {
        return reply.status(404).send({ error: 'Medical record not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Update medical record error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async deleteMedicalRecord(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await medicalService.deleteMedicalRecord(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({ error: 'Medical record not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete medical record error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getVaccinations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId } = request.params as { horseId: string };
      const vaccinations = await medicalService.getVaccinations(parseInt(horseId));
      return reply.send(vaccinations);
    } catch (error) {
      console.error('Get vaccinations error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async createVaccination(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId } = request.params as { horseId: string };
      const { name, date, nextDate, notes } = request.body as {
        name: string;
        date: string;
        nextDate?: string;
        notes?: string;
      };

      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const vaccination = await medicalService.createVaccination({
        horseId: parseInt(horseId),
        name,
        date: new Date(date),
        nextDate: nextDate ? new Date(nextDate) : undefined,
        veterinarianId: request.user.id,
        notes
      });

      return reply.status(201).send(vaccination);
    } catch (error) {
      console.error('Create vaccination error:', error);
      return reply.status(500).send({ error: 'Internal server error', e: error });
    }
  }

  async getUpcomingVaccinations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;
      const vaccinations = await medicalService.getUpcomingVaccinations(userId);
      return reply.send(vaccinations);
    } catch (error) {
      console.error('Get upcoming vaccinations error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getRestrictions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId } = request.params as { horseId: string };
      const restrictions = await medicalService.getRestrictions(parseInt(horseId));
      return reply.send({ restrictions });
    } catch (error) {
      console.error('Get restrictions error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getMedicalStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId } = request.params as { horseId: string };
      const stats = await medicalService.getMedicalStats(parseInt(horseId));
      return reply.send(stats);
    } catch (error) {
      console.error('Get medical stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const medicalController = new MedicalController();
