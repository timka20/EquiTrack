import { db } from '../config/database.js';
import { Horse, HorseStatus, HorseGender } from '../types/index.js';

export class HorseService {
  findAll(filters: { status?: HorseStatus; ownerId?: number; trainerId?: number; forSale?: boolean } = {}): Horse[] {
    let query = `
      SELECT h.*, 
        u1.first_name as owner_first_name, u1.last_name as owner_last_name,
        u2.first_name as trainer_first_name, u2.last_name as trainer_last_name,
        ub.first_name as breeder_first_name, ub.last_name as breeder_last_name
      FROM horses h 
      LEFT JOIN users u1 ON h.owner_id = u1.id 
      LEFT JOIN users u2 ON h.trainer_id = u2.id 
      LEFT JOIN users ub ON h.breeder_id = ub.id 
      WHERE 1=1`;
    const values: any[] = [];

    if (filters.status) {
      query += ' AND h.status = ?';
      values.push(filters.status);
    }

    if (filters.ownerId) {
      query += ' AND h.owner_id = ?';
      values.push(filters.ownerId);
    }

    if (filters.trainerId) {
      query += ' AND h.trainer_id = ?';
      values.push(filters.trainerId);
    }

    if (filters.forSale) {
      query += ' AND h.status = ?';
      values.push(HorseStatus.FOR_SALE);
    }

    query += ' ORDER BY h.created_at DESC';

    const rows = db.prepare(query).all(...values);

    return (rows as any[]).map(row => {

      const stats = db.prepare(`
        SELECT 
          COUNT(*) as totalRaces,
          SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END) as podiums,
          SUM(prize) as totalPrize
        FROM race_results
        WHERE horse_id = ?
      `).get(row.id) as any;

      return {
        ...row,
        birthYear: row.birth_year,
        birthCountry: row.birth_country,
        ownerId: row.owner_id,
        trainerId: row.trainer_id,
        breederId: row.breeder_id,
        totalEarnings: row.total_earnings,
        wins: stats?.wins || 0,
        podiums: stats?.podiums || 0,
        totalRaces: stats?.totalRaces || 0,
        ownerName: row.owner_first_name && row.owner_last_name 
          ? `${row.owner_first_name} ${row.owner_last_name}`.trim()
          : null,
        trainerName: row.trainer_first_name && row.trainer_last_name
          ? `${row.trainer_first_name} ${row.trainer_last_name}`.trim()
          : null,
        breederName: row.breeder_first_name && row.breeder_last_name
          ? `${row.breeder_first_name} ${row.breeder_last_name}`.trim()
          : null
      };
    });
  }

  findById(id: number): any | null {
    const row = db.prepare(`
      SELECT h.*, 
        u1.first_name as owner_first_name, u1.last_name as owner_last_name,
        u2.first_name as trainer_first_name, u2.last_name as trainer_last_name,
        ub.first_name as breeder_first_name, ub.last_name as breeder_last_name,
        f.id as father_id, f.name as father_name, f.color as father_color, f.birth_year as father_birth_year,
        m.id as mother_id, m.name as mother_name, m.color as mother_color, m.birth_year as mother_birth_year,
        ff.name as father_father_name, fm.name as father_mother_name,
        mf.name as mother_father_name, mm.name as mother_mother_name
      FROM horses h
      LEFT JOIN users u1 ON h.owner_id = u1.id
      LEFT JOIN users u2 ON h.trainer_id = u2.id
      LEFT JOIN users ub ON h.breeder_id = ub.id
      LEFT JOIN horses f ON h.father_id = f.id
      LEFT JOIN horses m ON h.mother_id = m.id
      LEFT JOIN horses ff ON f.father_id = ff.id
      LEFT JOIN horses fm ON f.mother_id = fm.id
      LEFT JOIN horses mf ON m.father_id = mf.id
      LEFT JOIN horses mm ON m.mother_id = mm.id
      WHERE h.id = ?
    `).get(id);

    if (!row) return null;

    const horse = row as Record<string, any>;

    const owner = horse.owner_first_name ? {
      id: horse.owner_id,
      name: `${horse.owner_first_name} ${horse.owner_last_name}`.trim(),
      firstName: horse.owner_first_name,
      lastName: horse.owner_last_name
    } : null;

    const breeder = horse.breeder_first_name ? {
      id: horse.breeder_id,
      name: `${horse.breeder_first_name} ${horse.breeder_last_name}`.trim(),
      firstName: horse.breeder_first_name,
      lastName: horse.breeder_last_name
    } : null;

    const trainer = horse.trainer_first_name ? {
      id: horse.trainer_id,
      name: `${horse.trainer_first_name} ${horse.trainer_last_name}`.trim(),
      firstName: horse.trainer_first_name,
      lastName: horse.trainer_last_name
    } : null;

    const pedigree = {
      father: horse.father_name ? {
        id: horse.father_id,
        name: horse.father_name,
        color: horse.father_color,
        birthYear: horse.father_birth_year,
        father: horse.father_father_name ? { name: horse.father_father_name } : null,
        mother: horse.father_mother_name ? { name: horse.father_mother_name } : null
      } : null,
      mother: horse.mother_name ? {
        id: horse.mother_id,
        name: horse.mother_name,
        color: horse.mother_color,
        birthYear: horse.mother_birth_year,
        father: horse.mother_father_name ? { name: horse.mother_father_name } : null,
        mother: horse.mother_mother_name ? { name: horse.mother_mother_name } : null
      } : null
    };

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalRaces,
        SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END) as podiums,
        SUM(prize) as totalPrize
      FROM race_results
      WHERE horse_id = ?
    `).get(id);

    const racesRows = db.prepare(`
      SELECT r.id, r.name, r.date, r.hippodrome, r.distance, rr.position, rr.race_time, rr.prize
      FROM race_results rr
      JOIN races r ON rr.race_id = r.id
      WHERE rr.horse_id = ?
      ORDER BY r.date DESC
    `).all(id);

    return {
      ...horse,
      birthYear: horse.birth_year,
      birthCountry: horse.birth_country,
      ownerId: horse.owner_id,
      trainerId: horse.trainer_id,
      breederId: horse.breeder_id,
      fatherId: horse.father_id,
      motherId: horse.mother_id,
      totalEarnings: horse.total_earnings,
      owner,
      breeder,
      trainer,
      pedigree,
      stats,
      raceHistory: racesRows
    };
  }

  create(horseData: Omit<Horse, 'id' | 'createdAt' | 'updatedAt'>): Horse {
    const result = db.prepare(
      'INSERT INTO horses (name, gender, color, birth_year, birth_country, breeder_id, owner_id, trainer_id, father_id, mother_id, status, photos, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      horseData.name,
      horseData.gender,
      horseData.color,
      horseData.birthYear,
      horseData.birthCountry,
      horseData.breederId || null,
      horseData.ownerId || null,
      horseData.trainerId || null,
      horseData.fatherId || null,
      horseData.motherId || null,
      horseData.status,
      JSON.stringify(horseData.photos || []),
      horseData.description || null
    );

    const id = result.lastInsertRowid as number;
    return this.findById(id) as Horse;
  }

  update(id: number, horseData: Partial<Horse>): Horse | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (horseData.name) { fields.push('name = ?'); values.push(horseData.name); }
    if (horseData.color) { fields.push('color = ?'); values.push(horseData.color); }
    if (horseData.birthYear) { fields.push('birth_year = ?'); values.push(horseData.birthYear); }
    if (horseData.ownerId !== undefined) { fields.push('owner_id = ?'); values.push(horseData.ownerId); }
    if (horseData.trainerId !== undefined) { fields.push('trainer_id = ?'); values.push(horseData.trainerId); }
    if (horseData.status) { fields.push('status = ?'); values.push(horseData.status); }
    if (horseData.photos) { fields.push('photos = ?'); values.push(JSON.stringify(horseData.photos)); }
    if (horseData.description !== undefined) { fields.push('description = ?'); values.push(horseData.description); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE horses SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM horses WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getStats(): any {
    const row = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_training' THEN 1 ELSE 0 END) as inTraining,
        SUM(CASE WHEN status = 'for_sale' THEN 1 ELSE 0 END) forSale,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
        SUM(CASE WHEN gender = 'stallion' THEN 1 ELSE 0 END) as stallions,
        SUM(CASE WHEN gender = 'mare' THEN 1 ELSE 0 END) as mares,
        SUM(CASE WHEN gender = 'gelding' THEN 1 ELSE 0 END) as geldings
      FROM horses
    `).get();
    return row;
  }

  getForSale(): any[] {
    const rows = db.prepare(`
      SELECT h.*, u.first_name as owner_first_name, u.last_name as owner_last_name,
        f.price, f.status as sale_status
      FROM horses h
      JOIN users u ON h.owner_id = u.id
      LEFT JOIN foals f ON h.id = f.horse_id
      WHERE h.status = 'for_sale' OR f.status = 'for_sale'
      ORDER BY f.price DESC
    `).all();
    return rows as any[];
  }

  getPedigree(id: number): any {
    const horse = this.findById(id);
    if (!horse) return null;
    return horse.pedigree;
  }
}

export const horseService = new HorseService();
