import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'booking' | 'material' | 'system' | 'platform';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  data?: any;
  createdAt: Date;
}

export class NotificationModel {
  static async findByUser(userId: string): Promise<Notification[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return (rows as any[]).map(row => this.mapRow(row));
  }

  static async findUnreadByUser(userId: string): Promise<Notification[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? AND `read` = false ORDER BY created_at DESC',
      [userId]
    );
    return (rows as any[]).map(row => this.mapRow(row));
  }

  static async create(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO notifications (id, user_id, title, message, type, \`read\`, data)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        notificationData.userId,
        notificationData.title,
        notificationData.message,
        notificationData.type,
        notificationData.read,
        notificationData.data ? JSON.stringify(notificationData.data) : null
      ]
    );
    return this.findById(id) as Promise<Notification>;
  }

  static async findById(id: string): Promise<Notification | null> {
    const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
    const notifications = rows as any[];
    return notifications.length > 0 ? this.mapRow(notifications[0]) : null;
  }

  static async markAsRead(id: string): Promise<void> {
    await pool.execute('UPDATE notifications SET `read` = true WHERE id = ?', [id]);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await pool.execute('UPDATE notifications SET `read` = true WHERE user_id = ?', [userId]);
  }

  static async delete(id: string): Promise<void> {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
  }

  static async deleteOld(userId: string, days: number = 30): Promise<void> {
    await pool.execute(
      'DELETE FROM notifications WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [userId, days]
    );
  }

  static async countUnread(userId: string): Promise<number> {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND `read` = false',
      [userId]
    );
    return (rows as any[])[0].count;
  }

  private static mapRow(row: any): Notification {
    let parsedData = undefined;
    if (row.data) {
      try {

        parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.error('Failed to parse notification data:', e);
        parsedData = row.data;
      }
    }

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      read: !!row.read,
      data: parsedData,
      createdAt: row.created_at
    };
  }
}
