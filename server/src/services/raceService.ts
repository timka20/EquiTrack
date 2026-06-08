import { db } from '../config/database.js';
import { Race, RaceStatus, RegistrationStatus } from '../types/index.js';

export class RaceService {
  findAll(filters: { status?: RaceStatus; upcoming?: boolean; past?: boolean } = {}): any[] {
    let query = `
      SELECT r.*, 
        (SELECT COUNT(*) FROM race_registrations WHERE race_id = r.id) as registrations_count,
        (SELECT COUNT(*) FROM race_registrations WHERE race_id = r.id AND status = 'approved') as approved_count
      FROM races r
      WHERE 1=1
    `;
    const values: any[] = [];

    if (filters.status) {
      query += ' AND r.status = ?';
      values.push(filters.status);
    }

    if (filters.upcoming) {
      query += " AND r.date >= date('now')";
    }

    if (filters.past) {
      query += " AND r.date < date('now')";
    }

    query += ' ORDER BY r.date DESC';

    try {
      const rows = db.prepare(query).all(...values);
      return rows as any[];
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  }

  findById(id: number): any | null {
    try {

      const row = db.prepare(`
        SELECT r.*,
          (SELECT COUNT(*) FROM race_registrations WHERE race_id = r.id) as registrations_count,
          (SELECT COUNT(*) FROM race_registrations WHERE race_id = r.id AND status = 'approved') as approved_count
        FROM races r
        WHERE r.id = ?
      `).get(id);

      if (!row) return null;

      const race = row as Record<string, any>;

      let participantsRows: any[] = [];
      try {
        participantsRows = db.prepare(`
          SELECT rr.*, h.name as horse_name, h.color as horse_color,
            ho.first_name as owner_first_name, ho.last_name as owner_last_name,
            u2.first_name as trainer_first_name, u2.last_name as trainer_last_name,
            u3.first_name as jockey_first_name, u3.last_name as jockey_last_name
          FROM race_registrations rr
          JOIN horses h ON rr.horse_id = h.id
          LEFT JOIN users ho ON h.owner_id = ho.id
          LEFT JOIN users u2 ON rr.trainer_id = u2.id
          LEFT JOIN users u3 ON rr.jockey_id = u3.id
          WHERE rr.race_id = ?
          ORDER BY rr.created_at DESC
        `).all(id) || [];
      } catch (e) {
        console.error('Error fetching participants:', e);
        participantsRows = [];
      }

      let resultsRows: any[] = [];
      try {
        resultsRows = db.prepare(`
          SELECT rr.*, h.name as horse_name, h.color as horse_color,
            u.first_name as jockey_first_name, u.last_name as jockey_last_name
          FROM race_results rr
          JOIN horses h ON rr.horse_id = h.id
          LEFT JOIN users u ON rr.jockey_id = u.id
          WHERE rr.race_id = ?
          ORDER BY rr.position ASC
        `).all(id) || [];
      } catch (e) {
        console.error('Error fetching results:', e);
        resultsRows = [];
      }

      return {
        ...race,
        participants: participantsRows,
        results: resultsRows
      };
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  create(raceData: Omit<Race, 'id' | 'createdAt' | 'updatedAt'>): Race {
    const dateStr = raceData.date instanceof Date 
      ? raceData.date.toISOString().split('T')[0]
      : String(raceData.date);

    const result = db.prepare(
      'INSERT INTO races (name, date, hippodrome, distance, prize_fund, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      raceData.name, 
      dateStr, 
      raceData.hippodrome, 
      raceData.distance, 
      raceData.prizeFund, 
      raceData.status, 
      raceData.description || null
    );

    const id = result.lastInsertRowid as number;
    return this.findById(id) as Race;
  }

  update(id: number, raceData: Partial<Race>): Race | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (raceData.name) { fields.push('name = ?'); values.push(raceData.name); }
    if (raceData.date) { 
      fields.push('date = ?'); 
      values.push(raceData.date instanceof Date ? raceData.date.toISOString().split('T')[0] : String(raceData.date));
    }
    if (raceData.hippodrome) { fields.push('hippodrome = ?'); values.push(raceData.hippodrome); }
    if (raceData.distance !== undefined) { fields.push('distance = ?'); values.push(raceData.distance); }
    if (raceData.prizeFund !== undefined) { fields.push('prize_fund = ?'); values.push(raceData.prizeFund); }
    if (raceData.status) { fields.push('status = ?'); values.push(raceData.status); }
    if (raceData.description !== undefined) { fields.push('description = ?'); values.push(raceData.description); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE races SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM races WHERE id = ?').run(id);
    return result.changes > 0;
  }

  register(raceId: number, registration: { horseId: number; ownerId: number; trainerId?: number; jockeyId?: number }): any {
    const result = db.prepare(
      'INSERT INTO race_registrations (race_id, horse_id, owner_id, trainer_id, jockey_id, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      raceId, 
      registration.horseId, 
      registration.ownerId, 
      registration.trainerId || null, 
      registration.jockeyId || null, 
      RegistrationStatus.PENDING
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM race_registrations WHERE id = ?').get(id);
    return row;
  }

  updateRegistrationStatus(registrationId: number, status: RegistrationStatus): boolean {
    const result = db.prepare(
      'UPDATE race_registrations SET status = ? WHERE id = ?'
    ).run(status, registrationId);
    return result.changes > 0;
  }

  addResults(raceId: number, results: { horseId: number; position: number; time?: string; prize?: number; notes?: string }[]): boolean {
    const insertResult = db.prepare(
      'INSERT INTO race_results (race_id, horse_id, position, race_time, prize, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const updateRace = db.prepare('UPDATE races SET status = ? WHERE id = ?');

    const transaction = db.transaction(() => {
      for (const result of results) {
        insertResult.run(
          raceId, 
          result.horseId, 
          result.position, 
          result.time || null, 
          result.prize || 0, 
          result.notes || null
        );
      }
      updateRace.run(RaceStatus.FINISHED, raceId);
    });

    try {
      transaction();
      return true;
    } catch (error) {
      throw error;
    }
  }

  getCalendar(year: number, month: number): any[] {

    try {
      const rows = db.prepare(`
        SELECT * FROM races 
        WHERE CAST(strftime('%Y', date) AS INTEGER) = ? AND CAST(strftime('%m', date) AS INTEGER) = ?
        ORDER BY date ASC
      `).all(year, month);
      return rows as any[];
    } catch (error) {
      console.error('Error in getCalendar:', error);
      return [];
    }
  }

  getStats(): any {
    try {
      const row = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'registration_open' THEN 1 ELSE 0 END) as registrationOpen,
          SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as finished,
          SUM(prize_fund) as totalPrizeFund
        FROM races
      `).get();
      return row;
    } catch (error) {
      console.error('Error in getStats:', error);
      return { total: 0, scheduled: 0, registrationOpen: 0, finished: 0, totalPrizeFund: 0 };
    }
  }
}

export const raceService = new RaceService();
