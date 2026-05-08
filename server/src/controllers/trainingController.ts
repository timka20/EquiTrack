import { FastifyRequest, FastifyReply } from 'fastify';
import { trainingService } from '../services/trainingService.js';

export class TrainingController {
  async getTrainings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId, trainerId, fromDate, toDate } = request.query as any;
      const filters: any = {};

      if (horseId) filters.horseId = parseInt(horseId);
      if (trainerId) filters.trainerId = parseInt(trainerId);
      if (fromDate) filters.fromDate = new Date(fromDate);
      if (toDate) filters.toDate = new Date(toDate);

      const trainings = await trainingService.getTrainings(filters);
      return reply.send(trainings);
    } catch (error) {
      console.error('Get trainings error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async createTraining(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId, date, type, duration, intensity, condition, notes } = request.body as {
        horseId: number;
        date: string;
        type: string;
        duration: number;
        intensity: 'low' | 'medium' | 'high';
        condition: string;
        notes?: string;
      };

      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const training = await trainingService.createTraining({
        horseId,
        trainerId: request.user.id,
        date: new Date(date),
        type,
        duration,
        intensity,
        horseCondition: condition,
        notes
      });

      return reply.status(201).send(training);
    } catch (error) {
      console.error('Create training error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateTraining(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const updated = await trainingService.updateTraining(parseInt(id), updateData);

      if (!updated) {
        return reply.status(404).send({ error: 'Training not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Update training error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async deleteTraining(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const deleted = await trainingService.deleteTraining(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({ error: 'Training not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete training error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getTrainingStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { horseId } = request.params as { horseId: string };
      const stats = await trainingService.getTrainingStats(parseInt(horseId));
      return reply.send(stats);
    } catch (error) {
      console.error('Get training stats error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getJockeyReports(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { raceId, horseId, jockeyId } = request.query as any;
      const filters: any = {};

      if (raceId) filters.raceId = parseInt(raceId);
      if (horseId) filters.horseId = parseInt(horseId);
      if (jockeyId) filters.jockeyId = parseInt(jockeyId);

      const reports = await trainingService.getJockeyReports(filters);
      return reply.send(reports);
    } catch (error) {
      console.error('Get jockey reports error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async createJockeyReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { raceId, horseId, startBehavior, distanceBehavior, finishBehavior, condition, equipmentNotes, recommendations } = request.body as {
        raceId: number;
        horseId: number;
        startBehavior: string;
        distanceBehavior: string;
        finishBehavior: string;
        condition: string;
        equipmentNotes?: string;
        recommendations?: string;
      };

      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const report = await trainingService.createJockeyReport({
        raceId,
        horseId,
        jockeyId: request.user.id,
        startBehavior,
        distanceBehavior,
        finishBehavior,
        horseCondition: condition,
        equipmentNotes,
        recommendations
      });

      return reply.status(201).send(report);
    } catch (error) {
      console.error('Create jockey report error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getTacticalInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { raceId, horseId } = request.params as { raceId: string; horseId: string };
      const info = await trainingService.getTacticalInfo(parseInt(raceId), parseInt(horseId));
      return reply.send(info);
    } catch (error) {
      console.error('Get tactical info error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getMyTrainings(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const trainings = await trainingService.getTrainings({ trainerId: request.user.id });
      return reply.send(trainings);
    } catch (error) {
      console.error('Get my trainings error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getMyReports(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const reports = await trainingService.getJockeyReports({ jockeyId: request.user.id });
      return reply.send(reports);
    } catch (error) {
      console.error('Get my reports error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const trainingController = new TrainingController();
