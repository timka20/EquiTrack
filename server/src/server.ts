import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import staticPlugin from '@fastify/static';
import multipart from '@fastify/multipart';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';
import { authenticate } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { authController } from './controllers/authController.js';
import { userController } from './controllers/userController.js';
import { horseController } from './controllers/horseController.js';
import { raceController } from './controllers/raceController.js';
import { breedingController } from './controllers/breedingController.js';
import { medicalController } from './controllers/medicalController.js';
import { trainingController } from './controllers/trainingController.js';
import { messageController } from './controllers/messageController.js';
import { analyticsController } from './controllers/analyticsController.js';

import { UserRole } from './types/index.js';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});

await fastify.register(cors, {
  origin: [env.FRONTEND_URL, 'http://localhost:27435', 'http://127.0.0.1:27435'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

await fastify.register(jwt, {
  secret: env.JWT_SECRET
});

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'EquiPulse API',
      description: 'API for EquiPulse Horse Racing Platform',
      version: '1.0.0'
    },
    servers: [{ url: 'http://0.0.0.0:49375' }]
  }
});

await fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});

await fastify.register(staticPlugin, {
  root: path.join(__dirname, '../../public'),
  prefix: '/',
});

await fastify.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

await fastify.register(authenticate);

const requireAuth = async (request: any, reply: any) => {
  await fastify.authenticate(request, reply);
};

const requireRole = (...roles: UserRole[]) => async (request: any, reply: any) => {
  await fastify.authenticate(request, reply);
  const allowed = new Set([UserRole.ADMIN, ...roles]);
  const userRole = request.user?.role;
  if (!request.user || !allowed.has(userRole)) {
    return reply.status(403).send({ error: 'Недостаточно прав для выполнения операции' });
  }
};

fastify.post('/api/auth/login', authController.login);
fastify.post('/api/auth/register', authController.register);
fastify.post('/api/auth/forgot-password', authController.forgotPassword);
fastify.get('/api/auth/me', { preHandler: requireAuth }, authController.me);
fastify.put('/api/auth/profile', { preHandler: requireAuth }, authController.updateProfile);

fastify.get('/api/users', { preHandler: requireAuth }, userController.getAll);
fastify.get('/api/users/stats', { preHandler: requireRole(UserRole.ADMIN) }, userController.getStats);
fastify.get('/api/users/trainers', { preHandler: requireAuth }, userController.getTrainers);
fastify.get('/api/users/jockeys', { preHandler: requireAuth }, userController.getJockeys);
fastify.get('/api/users/veterinarians', { preHandler: requireAuth }, userController.getVeterinarians);
fastify.get('/api/users/:id', { preHandler: requireAuth }, userController.getById);
fastify.post('/api/users', { preHandler: requireRole(UserRole.ADMIN) }, userController.create);
fastify.put('/api/users/:id', { preHandler: requireRole(UserRole.ADMIN) }, userController.update);
fastify.delete('/api/users/:id', { preHandler: requireRole(UserRole.ADMIN) }, userController.delete);

fastify.get('/api/horses', horseController.getAll);
fastify.get('/api/horses/stats', horseController.getStats);
fastify.get('/api/horses/for-sale', horseController.getForSale);
fastify.get('/api/horses/:id', horseController.getById);
fastify.get('/api/horses/:id/pedigree', horseController.getPedigree);
fastify.post('/api/horses', { preHandler: requireAuth }, horseController.create);
fastify.put('/api/horses/:id', { preHandler: requireAuth }, horseController.update);
fastify.delete('/api/horses/:id', { preHandler: requireAuth }, horseController.delete);
fastify.get('/api/my-horses', { preHandler: requireAuth }, horseController.getMyHorses);
fastify.get('/api/trainer/horses', { preHandler: requireRole(UserRole.TRAINER) }, horseController.getTrainerHorses);
fastify.put('/api/horses/:id/assign-trainer', { preHandler: requireAuth }, horseController.assignTrainer);

fastify.get('/api/races', raceController.getAll);
fastify.get('/api/races/stats', raceController.getStats);
fastify.get('/api/races/calendar', raceController.getCalendar);
fastify.get('/api/races/:id', raceController.getById);
fastify.post('/api/races', { preHandler: requireRole(UserRole.ADMIN) }, raceController.create);
fastify.put('/api/races/:id', { preHandler: requireRole(UserRole.ADMIN, UserRole.TRAINER, UserRole.OWNER_STUD, UserRole.OWNER_PRIVATE) }, raceController.update);
fastify.delete('/api/races/:id', { preHandler: requireRole(UserRole.ADMIN) }, raceController.delete);
fastify.post('/api/races/:id/register', { preHandler: requireAuth }, raceController.register);
fastify.put('/api/race-registrations/:registrationId/status', { preHandler: requireRole(UserRole.ADMIN) }, raceController.updateRegistrationStatus);
fastify.post('/api/races/:id/results', { preHandler: requireRole(UserRole.ADMIN) }, raceController.addResults);
fastify.get('/api/my-race-registrations', { preHandler: requireAuth }, raceController.getMyRegistrations);

fastify.get('/api/breedings', breedingController.getAll);
fastify.get('/api/breedings/stats', breedingController.getStats);
fastify.get('/api/breedings/:id', breedingController.getById);
fastify.post('/api/breedings', { preHandler: requireAuth }, breedingController.create);
fastify.put('/api/breedings/:id', { preHandler: requireAuth }, breedingController.update);
fastify.delete('/api/breedings/:id', { preHandler: requireAuth }, breedingController.delete);
fastify.post('/api/breedings/:id/foals', { preHandler: requireAuth }, breedingController.addFoal);
fastify.put('/api/foals/:foalId/status', { preHandler: requireAuth }, breedingController.updateFoalStatus);
fastify.get('/api/foals', breedingController.getFoals);
fastify.get('/api/horses/:id/price-prediction', breedingController.predictPrice);
fastify.get('/api/my-breedings', { preHandler: requireAuth }, breedingController.getMyBreedings);

fastify.get('/api/horses/:horseId/medical-records', { preHandler: requireAuth }, medicalController.getMedicalRecords);
fastify.post('/api/horses/:horseId/medical-records', { preHandler: requireRole(UserRole.VETERINARIAN, UserRole.ADMIN) }, medicalController.createMedicalRecord);
fastify.put('/api/medical-records/:id', { preHandler: requireRole(UserRole.VETERINARIAN, UserRole.ADMIN) }, medicalController.updateMedicalRecord);
fastify.delete('/api/medical-records/:id', { preHandler: requireRole(UserRole.VETERINARIAN, UserRole.ADMIN) }, medicalController.deleteMedicalRecord);
fastify.get('/api/horses/:horseId/vaccinations', { preHandler: requireAuth }, medicalController.getVaccinations);
fastify.post('/api/horses/:horseId/vaccinations', { preHandler: requireRole(UserRole.VETERINARIAN, UserRole.ADMIN) }, medicalController.createVaccination);
fastify.get('/api/upcoming-vaccinations', { preHandler: requireAuth }, medicalController.getUpcomingVaccinations);
fastify.get('/api/horses/:horseId/restrictions', { preHandler: requireAuth }, medicalController.getRestrictions);
fastify.get('/api/horses/:horseId/medical-stats', { preHandler: requireAuth }, medicalController.getMedicalStats);

fastify.get('/api/trainings', trainingController.getTrainings);
fastify.post('/api/trainings', { preHandler: requireRole(UserRole.TRAINER) }, trainingController.createTraining);
fastify.put('/api/trainings/:id', { preHandler: requireRole(UserRole.TRAINER) }, trainingController.updateTraining);
fastify.delete('/api/trainings/:id', { preHandler: requireRole(UserRole.TRAINER) }, trainingController.deleteTraining);
fastify.get('/api/horses/:horseId/training-stats', { preHandler: requireAuth }, trainingController.getTrainingStats);
fastify.get('/api/jockey-reports', trainingController.getJockeyReports);
fastify.post('/api/jockey-reports', { preHandler: requireRole(UserRole.JOCKEY) }, trainingController.createJockeyReport);
fastify.get('/api/races/:raceId/horses/:horseId/tactical-info', { preHandler: requireRole(UserRole.JOCKEY) }, trainingController.getTacticalInfo);
fastify.get('/api/my-trainings', { preHandler: requireRole(UserRole.TRAINER) }, trainingController.getMyTrainings);
fastify.get('/api/my-jockey-reports', { preHandler: requireRole(UserRole.JOCKEY) }, trainingController.getMyReports);

fastify.get('/api/messages/inbox', { preHandler: requireAuth }, messageController.getInbox);
fastify.get('/api/messages/sent', { preHandler: requireAuth }, messageController.getSent);
fastify.get('/api/messages/:id', { preHandler: requireAuth }, messageController.getById);
fastify.post('/api/messages', { preHandler: requireAuth }, messageController.create);
fastify.delete('/api/messages/:id', { preHandler: requireAuth }, messageController.delete);
fastify.get('/api/messages/unread-count', { preHandler: requireAuth }, messageController.getUnreadCount);

fastify.get('/api/notifications', { preHandler: requireAuth }, messageController.getNotifications);
fastify.put('/api/notifications/:id/read', { preHandler: requireAuth }, messageController.markNotificationAsRead);
fastify.put('/api/notifications/read-all', { preHandler: requireAuth }, messageController.markAllNotificationsAsRead);
fastify.delete('/api/notifications/:id', { preHandler: requireAuth }, messageController.deleteNotification);
fastify.get('/api/notifications/unread-count', { preHandler: requireAuth }, messageController.getUnreadNotificationsCount);

fastify.get('/api/analytics/owner', { preHandler: requireRole(UserRole.OWNER_PRIVATE, UserRole.OWNER_STUD) }, analyticsController.getOwnerAnalytics);
fastify.get('/api/analytics/trainer', { preHandler: requireRole(UserRole.TRAINER) }, analyticsController.getTrainerAnalytics);
fastify.get('/api/analytics/jockey', { preHandler: requireRole(UserRole.JOCKEY) }, analyticsController.getJockeyAnalytics);
fastify.get('/api/analytics/admin', { preHandler: requireRole(UserRole.ADMIN) }, analyticsController.getAdminAnalytics);
fastify.get('/api/analytics/dashboard', { preHandler: requireAuth }, analyticsController.getDashboardStats);
fastify.get('/api/analytics/me', { preHandler: requireAuth }, analyticsController.getMyAnalytics);

fastify.get('/api/admin/stats', { preHandler: requireRole(UserRole.ADMIN) }, async (request, reply) => {
  try {
    const db = (await import('./config/database.js')).db;
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const pendingApps = db.prepare("SELECT COUNT(*) as count FROM race_registrations WHERE status = 'pending'").get() as { count: number };
    const horses = db.prepare('SELECT COUNT(*) as count FROM horses').get() as { count: number };
    const activeEvents = db.prepare("SELECT COUNT(*) as count FROM races WHERE status != 'finished' AND date >= date('now')").get() as { count: number };

    return reply.send({
      users: users?.count || 0,
      pendingApplications: pendingApps?.count || 0,
      horses: horses?.count || 0,
      activeEvents: activeEvents?.count || 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.get('/api/race-registrations/pending', { preHandler: requireRole(UserRole.ADMIN) }, async (request, reply) => {
  try {
    const db = (await import('./config/database.js')).db;
    const rows = db.prepare(`
      SELECT rr.*, 
        h.name as horse_name, h.color as horse_color,
        r.name as race_name, r.date as race_date, r.hippodrome,
        u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM race_registrations rr
      JOIN horses h ON rr.horse_id = h.id
      JOIN races r ON rr.race_id = r.id
      JOIN users u ON rr.owner_id = u.id
      WHERE rr.status = 'pending'
      ORDER BY r.date ASC
    `).all();
    return reply.send(rows);
  } catch (error) {
    console.error('Pending registrations error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.post('/api/race-registrations/:id/approve', { preHandler: requireRole(UserRole.ADMIN) }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { notificationService } = await import('./services/notificationService.js');
    const db = (await import('./config/database.js')).db;

    const registration = db.prepare(`
      SELECT rr.*, h.name as horse_name, r.name as race_name, r.date as race_date
      FROM race_registrations rr
      JOIN horses h ON rr.horse_id = h.id
      JOIN races r ON rr.race_id = r.id
      WHERE rr.id = ?
    `).get(parseInt(id)) as any;

    db.prepare("UPDATE race_registrations SET status = 'approved' WHERE id = ?").run(parseInt(id));

    if (registration) {
      notificationService.notifyRaceRegistrationApproved(
        registration.owner_id,
        registration.race_name,
        registration.horse_name
      );
    }

    return reply.send({ success: true });
  } catch (error) {
    console.error('Approve registration error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.post('/api/race-registrations/:id/reject', { preHandler: requireRole(UserRole.ADMIN) }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { notificationService } = await import('./services/notificationService.js');
    const db = (await import('./config/database.js')).db;

    const registration = db.prepare(`
      SELECT rr.*, h.name as horse_name, r.name as race_name
      FROM race_registrations rr
      JOIN horses h ON rr.horse_id = h.id
      JOIN races r ON rr.race_id = r.id
      WHERE rr.id = ?
    `).get(parseInt(id)) as any;

    db.prepare("UPDATE race_registrations SET status = 'rejected' WHERE id = ?").run(parseInt(id));

    if (registration) {
      notificationService.notifyRaceRegistrationRejected(
        registration.owner_id,
        registration.race_name,
        registration.horse_name
      );
    }

    return reply.send({ success: true });
  } catch (error) {
    console.error('Reject registration error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

fastify.put('/api/users/:id/password', { preHandler: requireRole(UserRole.ADMIN) }, async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { password } = request.body as { password: string };
    if (!password || password.length < 6) {
      return reply.status(400).send({ error: 'Пароль должен быть не менее 6 символов' });
    }
    const { hashPassword } = await import('./utils/helpers.js');
    const hashedPassword = await hashPassword(password);
    const userService = (await import('./services/userService.js')).userService;
    const updated = userService.update(parseInt(id), { password: hashedPassword });
    if (!updated) {
      return reply.status(404).send({ error: 'Пользователь не найден' });
    }
    return reply.send({ success: true });
  } catch (error) {
    console.error('Update password error:', error);
    return reply.status(500).send({ error: 'Ошибка при изменении пароля' });
  }
});

fastify.post('/api/upload', async (request, reply) => {
  try {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }
    const uploadDir = path.join(__dirname, '../../public/images/horses');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(data.filename) || '.jpg';
    const filename = `horse_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filepath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filepath, await data.toBuffer());
    return reply.send({ url: `/images/horses/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return reply.status(500).send({ error: 'Upload failed' });
  }
});

fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

const start = async () => {
  try {
    const dbConnected = testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📚 API Documentation: /documentation`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
