import { pool } from '../config/database';
import { Platform, PlatformStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    let value = obj[key];

    if (value instanceof Date) {
      value = value.toISOString();
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {

      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          value = date.toISOString();
        }
      } catch (e) {

      }
    }
    result[camelKey] = value;
  }
  return result;
}

export class PlatformModel {
  static async findAll(status?: PlatformStatus): Promise<Platform[]> {
    let query = 'SELECT * FROM platforms';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const [rows] = await pool.execute(query, params);
    return rows as Platform[];
  }

  static async findActive(): Promise<Platform[]> {
    const [rows] = await pool.execute('SELECT * FROM platforms WHERE status = "active"');
    return rows as Platform[];
  }

  static async findById(id: string): Promise<Platform | null> {
    const [rows] = await pool.execute('SELECT * FROM platforms WHERE id = ?', [id]);
    const platforms = rows as Platform[];
    return platforms.length > 0 ? platforms[0] : null;
  }

  static async findByOwner(ownerId: string): Promise<Platform[]> {
    const [rows] = await pool.execute('SELECT * FROM platforms WHERE owner_id = ?', [ownerId]);
    return rows as Platform[];
  }

  static async findPending(): Promise<Platform[]> {
    const [rows] = await pool.execute('SELECT * FROM platforms WHERE status = "pending"');
    return rows as Platform[];
  }

  static async create(platformData: Omit<Platform, 'id' | 'createdAt' | 'updatedAt'>): Promise<Platform> {
    const id = uuidv4();

    const values = [
      id,
      platformData.name,
      platformData.type,
      platformData.address,
      platformData.city ?? null,
      platformData.pricePerDay ?? 0,
      platformData.rating ?? 5.0,
      platformData.reviewsCount ?? 0,
      platformData.image || 'https://via.placeholder.com/800x600?text=No+Image',
      JSON.stringify(platformData.images || []),
      platformData.description ?? null,
      platformData.size ?? null,
      platformData.format ?? null,
      platformData.illumination ?? false,
      platformData.traffic ?? null,
      platformData.available ?? true,
      platformData.ownerId ?? null,
      platformData.status || 'pending'
    ];

    const sanitizedValues = values.map(v => v === undefined ? null : v);

    await pool.execute(
      `INSERT INTO platforms (id, name, type, address, city, price_per_day, rating, reviews_count,
       image, images, description, size, format, illumination, traffic, available, owner_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      sanitizedValues
    );
    return this.findById(id) as Promise<Platform>;
  }

  static async update(id: string, updates: Partial<Platform>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.type) { fields.push('type = ?'); values.push(updates.type); }
    if (updates.address) { fields.push('address = ?'); values.push(updates.address); }
    if (updates.city) { fields.push('city = ?'); values.push(updates.city); }
    if (updates.pricePerDay !== undefined) { fields.push('price_per_day = ?'); values.push(updates.pricePerDay); }
    if (updates.image) { fields.push('image = ?'); values.push(updates.image); }
    if (updates.images) { fields.push('images = ?'); values.push(JSON.stringify(updates.images)); }
    if (updates.description) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.size) { fields.push('size = ?'); values.push(updates.size); }
    if (updates.format) { fields.push('format = ?'); values.push(updates.format); }
    if (updates.illumination !== undefined) { fields.push('illumination = ?'); values.push(updates.illumination); }
    if (updates.traffic) { fields.push('traffic = ?'); values.push(updates.traffic); }
    if (updates.available !== undefined) { fields.push('available = ?'); values.push(updates.available); }
    if (updates.status) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.rating !== undefined) { fields.push('rating = ?'); values.push(updates.rating); }
    if (updates.reviewsCount !== undefined) { fields.push('reviews_count = ?'); values.push(updates.reviewsCount); }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(`UPDATE platforms SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id: string): Promise<void> {
    await pool.execute('DELETE FROM platforms WHERE id = ?', [id]);
  }

  static async approve(id: string): Promise<void> {
    await pool.execute('UPDATE platforms SET status = "active" WHERE id = ?', [id]);
  }

  static async reject(id: string): Promise<void> {
    await pool.execute('UPDATE platforms SET status = "rejected" WHERE id = ?', [id]);
  }

  static async updateAvailability(id: string, available: boolean): Promise<void> {
    await pool.execute('UPDATE platforms SET available = ? WHERE id = ?', [available, id]);
  }

  static async count(status?: PlatformStatus): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM platforms';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const [rows] = await pool.execute(query, params);
    return (rows as any[])[0].count;
  }

  static async search(query: string, city?: string, type?: string): Promise<Platform[]> {
    let sql = 'SELECT * FROM platforms WHERE status = "active" AND (name LIKE ? OR address LIKE ? OR city LIKE ?)';
    const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (city) {
      sql += ' AND city = ?';
      params.push(city);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    const [rows] = await pool.execute(sql, params);
    return rows as Platform[];
  }

  static async findPopular(limit: number = 10): Promise<Platform[]> {
    const [rows] = await pool.query(
      `SELECT * FROM platforms
       WHERE status = "active"
       ORDER BY rating DESC, reviews_count DESC
       LIMIT ${parseInt(limit as any)}`
    );
    return rows as Platform[];
  }

  static async findNearby(lat: number, lng: number, radiusKm: number = 50): Promise<Platform[]> {

    const [rows] = await pool.execute(
      `SELECT *, (
        6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )
      ) AS distance
      FROM platforms
      WHERE status = "active"
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      HAVING distance < ?
      ORDER BY distance
      LIMIT 20`,
      [lat, lng, lat, radiusKm]
    );
    return rows as Platform[];
  }
}
