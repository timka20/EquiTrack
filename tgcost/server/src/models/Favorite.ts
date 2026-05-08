import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class FavoriteModel {
  static async findByUser(userId: string): Promise<any[]> {
    const [rows] = await pool.execute(`
      SELECT p.*, f.created_at as favorited_at
      FROM favorites f
      JOIN platforms p ON f.platform_id = p.id
      WHERE f.user_id = ?
    `, [userId]);
    return rows as any[];
  }

  static async isFavorite(userId: string, platformId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND platform_id = ?',
      [userId, platformId]
    );
    return (rows as any[])[0].count > 0;
  }

  static async add(userId: string, platformId: string): Promise<void> {
    const id = uuidv4();
    try {
      await pool.execute(
        'INSERT INTO favorites (id, user_id, platform_id) VALUES (?, ?, ?)',
        [id, userId, platformId]
      );
    } catch (e) {

    }
  }

  static async remove(userId: string, platformId: string): Promise<void> {
    await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND platform_id = ?',
      [userId, platformId]
    );
  }

  static async toggle(userId: string, platformId: string): Promise<boolean> {
    const isFav = await this.isFavorite(userId, platformId);
    if (isFav) {
      await this.remove(userId, platformId);
      return false;
    } else {
      await this.add(userId, platformId);
      return true;
    }
  }
}
