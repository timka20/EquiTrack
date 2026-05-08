import { db } from '../config/database.js';
import { Notification } from '../types/index.js';

export class NotificationService {

  create(userId: number, type: string, title: string, message: string): Notification {
    const result = db.prepare(
      'INSERT INTO notifications (user_id, type, title, message, is_read) VALUES (?, ?, ?, ?, 0)'
    ).run(userId, type, title, message);

    const id = result.lastInsertRowid as number;
    return this.findById(id) as Notification;
  }

  findById(id: number): Notification | null {
    const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    return row as Notification | null;
  }

  findByUserId(userId: number): Notification[] {
    const rows = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId);
    return rows as Notification[];
  }

  findUnreadByUserId(userId: number): Notification[] {
    const rows = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC'
    ).all(userId);
    return rows as Notification[];
  }

  getUnreadCount(userId: number): number {
    const row = db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
    ).get(userId) as { count: number };
    return row?.count || 0;
  }

  markAsRead(id: number): boolean {
    const result = db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE id = ?'
    ).run(id);
    return result.changes > 0;
  }

  markAllAsRead(userId: number): boolean {
    const result = db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0'
    ).run(userId);
    return result.changes > 0;
  }

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
    return result.changes > 0;
  }

  notifyRaceRegistrationApproved(userId: number, raceName: string, horseName: string): Notification {
    return this.create(
      userId,
      'race_registration_approved',
      'Заявка одобрена',
      `Ваша заявка на участие в скачке "${raceName}" с лошадью "${horseName}" была одобрена.`
    );
  }

  notifyRaceRegistrationRejected(userId: number, raceName: string, horseName: string): Notification {
    return this.create(
      userId,
      'race_registration_rejected',
      'Заявка отклонена',
      `Ваша заявка на участие в скачке "${raceName}" с лошадью "${horseName}" была отклонена.`
    );
  }

  notifyUpcomingRace(userId: number, raceName: string, raceDate: string): Notification {
    return this.create(
      userId,
      'upcoming_race',
      'Предстоящая скачка',
      `Напоминание: скачка "${raceName}" состоится ${raceDate}.`
    );
  }

  notifyNewMedicalRecord(userId: number, horseName: string, recordType: string): Notification {
    return this.create(
      userId,
      'new_medical_record',
      'Новая медицинская запись',
      `Для лошади "${horseName}" добавлена новая медицинская запись: ${recordType}.`
    );
  }

  notifyVaccinationReminder(userId: number, horseName: string, vaccineName: string): Notification {
    return this.create(
      userId,
      'vaccination_reminder',
      'Напоминание о прививке',
      `Не забудьте сделать прививку "${vaccineName}" лошади "${horseName}".`
    );
  }

  notifyNewJockeyReport(userId: number, jockeyName: string, raceName: string): Notification {
    return this.create(
      userId,
      'new_jockey_report',
      'Новый отчет жокея',
      `Жокей ${jockeyName} отправил отчет по скачке "${raceName}".`
    );
  }
}

export const notificationService = new NotificationService();
