import { db } from '../config/database.js';
import { Message, Notification } from '../types/index.js';

export class MessageService {
  getInbox(userId: number): any[] {
    const rows = db.prepare(`
      SELECT m.*, 
        u.first_name as sender_first_name, u.last_name as sender_last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ?
      ORDER BY m.created_at DESC
    `).all(userId);
    return rows as any[];
  }

  getSent(userId: number): any[] {
    const rows = db.prepare(`
      SELECT m.*, 
        u.first_name as receiver_first_name, u.last_name as receiver_last_name
      FROM messages m
      JOIN users u ON m.receiver_id = u.id
      WHERE m.sender_id = ?
      ORDER BY m.created_at DESC
    `).all(userId);
    return rows as any[];
  }

  getMessage(id: number, userId: number): any | null {
    const row = db.prepare(`
      SELECT m.*,
        s.first_name as sender_first_name, s.last_name as sender_last_name,
        r.first_name as receiver_first_name, r.last_name as receiver_last_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.id = ? AND (m.sender_id = ? OR m.receiver_id = ?)
    `).get(id, userId, userId);

    if (!row) return null;

    const message = row as Record<string, any>;

    if (message.receiver_id === userId && !message.is_read) {
      db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);
      message.is_read = 1;
    }

    return message;
  }

  createMessage(message: Omit<Message, 'id' | 'isRead' | 'createdAt'>): Message {
    const result = db.prepare(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES (?, ?, ?, ?)'
    ).run(
      message.senderId, 
      message.receiverId, 
      message.subject, 
      message.content
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    return row as Message;
  }

  deleteMessage(id: number, userId: number): boolean {
    const result = db.prepare(
      'DELETE FROM messages WHERE id = ? AND (sender_id = ? OR receiver_id = ?)'
    ).run(id, userId, userId);
    return result.changes > 0;
  }

  getUnreadCount(userId: number): number {
    const row = db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0'
    ).get(userId) as { count: number } | undefined;
    return row?.count || 0;
  }

  markAsRead(id: number): boolean {
    const result = db.prepare(
      'UPDATE messages SET is_read = 1 WHERE id = ?'
    ).run(id);
    return result.changes > 0;
  }
}

export class NotificationService {
  getNotifications(userId: number, unreadOnly: boolean = false): any[] {
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const values: any[] = [userId];

    if (unreadOnly) {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...values);
    return rows as any[];
  }

  createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const result = db.prepare(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)'
    ).run(
      notification.userId, 
      notification.type, 
      notification.title, 
      notification.message
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    return row as Notification;
  }

  markAsRead(id: number, userId: number): boolean {
    const result = db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?'
    ).run(id, userId);
    return result.changes > 0;
  }

  markAllAsRead(userId: number): boolean {
    const result = db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0'
    ).run(userId);
    return result.changes > 0;
  }

  deleteNotification(id: number, userId: number): boolean {
    const result = db.prepare(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?'
    ).run(id, userId);
    return result.changes > 0;
  }

  getUnreadCount(userId: number): number {
    const row = db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
    ).get(userId) as { count: number } | undefined;
    return row?.count || 0;
  }
}

export const messageService = new MessageService();
export const notificationService = new NotificationService();
