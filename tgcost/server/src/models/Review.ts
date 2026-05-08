import { pool } from '../config/database';
import { Review } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ReviewModel {
  static async findByPlatform(platformId: string): Promise<Review[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE platform_id = ? ORDER BY created_at DESC',
      [platformId]
    );
    return rows as Review[];
  }

  static async create(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO reviews (id, platform_id, user_id, user_name, rating, text, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, reviewData.platformId, reviewData.userId, reviewData.userName, reviewData.rating, reviewData.text, reviewData.date]
    );

    await this.updatePlatformRating(reviewData.platformId);

    return this.findById(id) as Promise<Review>;
  }

  static async findById(id: string): Promise<Review | null> {
    const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    const reviews = rows as Review[];
    return reviews.length > 0 ? reviews[0] : null;
  }

  static async updatePlatformRating(platformId: string): Promise<void> {
    const [rows] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE platform_id = ?',
      [platformId]
    );
    const result = (rows as any[])[0];
    await pool.execute(
      'UPDATE platforms SET rating = ?, reviews_count = ? WHERE id = ?',
      [result.avg_rating || 5.0, result.count, platformId]
    );
  }

  static async delete(id: string): Promise<void> {
    const review = await this.findById(id);
    if (review) {
      await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
      await this.updatePlatformRating(review.platformId);
    }
  }
}
