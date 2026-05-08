import { pool } from '../config/database';
import { Booking, BookingStatus, MaterialStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PlatformModel } from './Platform';

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

export class BookingModel {
  static async findAll(): Promise<Booking[]> {
    const [rows] = await pool.execute('SELECT * FROM bookings ORDER BY created_at DESC');
    return toCamelCase(rows) as Booking[];
  }

  static async findById(id: string): Promise<Booking | null> {
    const [rows] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    const bookings = rows as any[];
    return bookings.length > 0 ? toCamelCase(bookings[0]) as Booking : null;
  }

  static async findByUser(userId: string): Promise<Booking[]> {
    const [rows] = await pool.execute(
      `SELECT b.*, p.name as platform_name, p.address as platform_address, p.image as platform_image, p.city as platform_city, p.price_per_day as platform_price
       FROM bookings b
       JOIN platforms p ON b.platform_id = p.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return toCamelCase(rows) as Booking[];
  }

  static async findByPlatform(platformId: string): Promise<Booking[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM bookings WHERE platform_id = ? ORDER BY created_at DESC',
      [platformId]
    );
    return toCamelCase(rows) as Booking[];
  }

  static async create(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO bookings (id, platform_id, user_id, start_date, end_date, total_price, status, material_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bookingData.platformId,
        bookingData.userId,
        bookingData.startDate,
        bookingData.endDate,
        bookingData.totalPrice,
        bookingData.status || 'pending',
        bookingData.materialStatus || 'none'
      ]
    );

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    for (const date of dates) {
      const dateId = uuidv4();
      try {
        await pool.execute(
          'INSERT INTO booked_dates (id, platform_id, booking_id, date) VALUES (?, ?, ?, ?)',
          [dateId, bookingData.platformId, id, date]
        );
      } catch (e) {

      }
    }

    await PlatformModel.updateAvailability(bookingData.platformId, false);

    return this.findById(id) as Promise<Booking>;
  }

  static async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  }

  static async updateMaterialStatus(id: string, status: MaterialStatus, rejectionReason?: string): Promise<void> {
    if (rejectionReason) {
      await pool.execute(
        'UPDATE bookings SET material_status = ?, rejection_reason = ? WHERE id = ?',
        [status, rejectionReason, id]
      );
    } else {
      await pool.execute('UPDATE bookings SET material_status = ? WHERE id = ?', [status, id]);
    }
  }

  static async updateMaterialUrl(id: string, materialUrl: string): Promise<void> {
    await pool.execute(
      'UPDATE bookings SET material_url = ?, material_status = "pending" WHERE id = ?',
      [materialUrl, id]
    );
  }

  static async cancel(id: string): Promise<void> {

    const booking = await this.findById(id);
    if (booking) {
      await pool.execute('UPDATE bookings SET status = "cancelled" WHERE id = ?', [id]);

      await pool.execute('DELETE FROM booked_dates WHERE booking_id = ?', [id]);

      const [activeBookings] = await pool.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE platform_id = ? AND status IN ("pending", "confirmed") AND id != ?',
        [booking.platformId, id]
      );

      if ((activeBookings as any[])[0].count === 0) {
        await PlatformModel.updateAvailability(booking.platformId, true);
      }
    }
  }

  static async delete(id: string): Promise<void> {
    await pool.execute('DELETE FROM booked_dates WHERE booking_id = ?', [id]);
    await pool.execute('DELETE FROM bookings WHERE id = ?', [id]);
  }

  static async count(status?: BookingStatus): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM bookings';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const [rows] = await pool.execute(query, params);
    return (rows as any[])[0].count;
  }

  static async getPendingMaterials(): Promise<any[]> {
    const [rows] = await pool.execute(`
      SELECT b.*, p.name as platform_name, u.name as user_name
      FROM bookings b
      JOIN platforms p ON b.platform_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE b.material_status = 'pending'
      ORDER BY b.created_at DESC
    `);
    return toCamelCase(rows) as any[];
  }

  static async getPendingBookings(): Promise<any[]> {
    const [rows] = await pool.execute(`
      SELECT b.*, p.name as platform_name, u.name as user_name
      FROM bookings b
      JOIN platforms p ON b.platform_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
    `);
    return toCamelCase(rows) as any[];
  }

  static async getBookedDates(platformId: string): Promise<string[]> {
    const [rows] = await pool.execute(
      'SELECT date FROM booked_dates WHERE platform_id = ?',
      [platformId]
    );
    return (rows as any[]).map(r => {

      if (r.date instanceof Date) {
        return r.date.toISOString().split('T')[0];
      }

      if (typeof r.date === 'string') {
        return r.date.split('T')[0];
      }
      return String(r.date);
    });
  }

  static async isDateAvailable(platformId: string, date: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM booked_dates WHERE platform_id = ? AND date = ?',
      [platformId, date]
    );
    return (rows as any[])[0].count === 0;
  }
}
