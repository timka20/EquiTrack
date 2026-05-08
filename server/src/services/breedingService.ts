import { db } from '../config/database.js';
import { Breeding, BreedingStatus, Foal, FoalStatus } from '../types/index.js';

export class BreedingService {
  findAll(filters: { status?: BreedingStatus; mareId?: number; stallionId?: number } = {}): any[] {
    let query = `
      SELECT b.*, 
        m.name as mare_name, m.color as mare_color,
        s.name as stallion_name, s.color as stallion_color,
        u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM breedings b
      JOIN horses m ON b.mare_id = m.id
      JOIN horses s ON b.stallion_id = s.id
      LEFT JOIN users u ON m.owner_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (filters.status) {
      query += ' AND b.status = ?';
      values.push(filters.status);
    }

    if (filters.mareId) {
      query += ' AND b.mare_id = ?';
      values.push(filters.mareId);
    }

    if (filters.stallionId) {
      query += ' AND b.stallion_id = ?';
      values.push(filters.stallionId);
    }

    query += ' ORDER BY b.planned_date DESC';

    const rows = db.prepare(query).all(...values);
    return rows as any[];
  }

  findById(id: number): any | null {
    const row = db.prepare(`
      SELECT b.*,
        m.name as mare_name, m.color as mare_color, m.birth_year as mare_birth_year,
        s.name as stallion_name, s.color as stallion_color, s.birth_year as stallion_birth_year
      FROM breedings b
      JOIN horses m ON b.mare_id = m.id
      JOIN horses s ON b.stallion_id = s.id
      WHERE b.id = ?
    `).get(id);

    if (!row) return null;

    const breeding = row as Record<string, any>;

    const foalsRows = db.prepare(`
      SELECT f.*, h.name, h.gender, h.color, h.birth_year, h.photos
      FROM foals f
      JOIN horses h ON f.horse_id = h.id
      WHERE f.breeding_id = ?
    `).all(id);

    return {
      ...breeding,
      foals: foalsRows
    };
  }

  create(breedingData: Omit<Breeding, 'id' | 'createdAt'>): Breeding {

    const plannedDateStr = breedingData.plannedDate instanceof Date 
      ? breedingData.plannedDate.toISOString().split('T')[0]
      : String(breedingData.plannedDate);

    const actualDateStr = breedingData.actualDate 
      ? (breedingData.actualDate instanceof Date 
          ? breedingData.actualDate.toISOString().split('T')[0]
          : String(breedingData.actualDate))
      : null;

    const expectedFoalingDateStr = breedingData.expectedFoalingDate
      ? (breedingData.expectedFoalingDate instanceof Date
          ? breedingData.expectedFoalingDate.toISOString().split('T')[0]
          : String(breedingData.expectedFoalingDate))
      : null;

    const result = db.prepare(
      'INSERT INTO breedings (mare_id, stallion_id, planned_date, actual_date, status, expected_foaling_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      breedingData.mareId,
      breedingData.stallionId,
      plannedDateStr,
      actualDateStr,
      breedingData.status,
      expectedFoalingDateStr,
      breedingData.notes || null
    );

    const id = result.lastInsertRowid as number;
    return this.findById(id) as Breeding;
  }

  update(id: number, breedingData: Partial<Breeding>): Breeding | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (breedingData.plannedDate) { 
      fields.push('planned_date = ?'); 
      values.push(breedingData.plannedDate instanceof Date 
        ? breedingData.plannedDate.toISOString().split('T')[0]
        : String(breedingData.plannedDate));
    }
    if (breedingData.actualDate) { 
      fields.push('actual_date = ?'); 
      values.push(breedingData.actualDate instanceof Date
        ? breedingData.actualDate.toISOString().split('T')[0]
        : String(breedingData.actualDate));
    }
    if (breedingData.status) { fields.push('status = ?'); values.push(breedingData.status); }
    if (breedingData.expectedFoalingDate) { 
      fields.push('expected_foaling_date = ?'); 
      values.push(breedingData.expectedFoalingDate instanceof Date
        ? breedingData.expectedFoalingDate.toISOString().split('T')[0]
        : String(breedingData.expectedFoalingDate));
    }
    if (breedingData.notes !== undefined) { fields.push('notes = ?'); values.push(breedingData.notes); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE breedings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM breedings WHERE id = ?').run(id);
    return result.changes > 0;
  }

  addFoal(breedingId: number, foalData: { horseId: number; status?: FoalStatus; price?: number; notes?: string }): Foal {
    const result = db.prepare(
      'INSERT INTO foals (breeding_id, horse_id, status, price, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(
      breedingId, 
      foalData.horseId, 
      foalData.status || FoalStatus.AT_STUD, 
      foalData.price || null, 
      foalData.notes || null
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM foals WHERE id = ?').get(id);
    return row as Foal;
  }

  updateFoalStatus(foalId: number, status: FoalStatus, data?: { price?: number; buyerId?: number }): boolean {
    const fields: string[] = ['status = ?'];
    const values: any[] = [status];

    if (data?.price) { fields.push('price = ?'); values.push(data.price); }
    if (data?.buyerId) { fields.push('buyer_id = ?'); values.push(data.buyerId); }
    if (status === FoalStatus.RESERVED || status === FoalStatus.SOLD) {
      fields.push('reservation_date = ?');
      values.push(new Date().toISOString().split('T')[0]);
    }

    values.push(foalId);
    const result = db.prepare(`UPDATE foals SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return result.changes > 0;
  }

  getFoals(filters: { status?: FoalStatus; ownerId?: number } = {}): any[] {
    let query = `
      SELECT f.*, h.name, h.gender, h.color, h.birth_year, h.photos,
        b.mare_id, b.stallion_id, m.name as mare_name, s.name as stallion_name,
        u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM foals f
      JOIN horses h ON f.horse_id = h.id
      JOIN breedings b ON f.breeding_id = b.id
      JOIN horses m ON b.mare_id = m.id
      JOIN horses s ON b.stallion_id = s.id
      LEFT JOIN users u ON h.owner_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (filters.status) {
      query += ' AND f.status = ?';
      values.push(filters.status);
    }

    if (filters.ownerId) {
      query += ' AND h.owner_id = ?';
      values.push(filters.ownerId);
    }

    query += ' ORDER BY h.birth_year DESC';

    try {
      const rows = db.prepare(query).all(...values);
      return rows as any[];
    } catch (error) {
      console.error('Error in getFoals:', error);

      return [];
    }
  }

  getStats(): any {
    const breedingRow = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pregnancy_confirmed' THEN 1 ELSE 0 END) as pregnancyConfirmed
      FROM breedings
    `).get();

    const foalRow = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'at_stud' THEN 1 ELSE 0 END) as atStud,
        SUM(CASE WHEN status = 'for_sale' THEN 1 ELSE 0 END) as forSale,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
        SUM(price) as totalValue
      FROM foals
    `).get();

    return {
      breedings: breedingRow,
      foals: foalRow
    };
  }

  getPredictedPrice(horseId: number): { predictedPrice: number; confidence: string; factors: any } {

    const horseRow = db.prepare(`
      SELECT h.*, f.name as father_name, m.name as mother_name
      FROM horses h
      LEFT JOIN horses f ON h.father_id = f.id
      LEFT JOIN horses m ON h.mother_id = m.id
      WHERE h.id = ?
    `).get(horseId);

    if (!horseRow) {
      throw new Error('Horse not found');
    }

    const horse = horseRow as Record<string, any>;

    const fatherStats = db.prepare(`
      SELECT SUM(prize) as totalPrize, COUNT(*) as races
      FROM race_results
      WHERE horse_id = ?
    `).get(horse.father_id) as { totalPrize: number } | undefined;

    const motherStats = db.prepare(`
      SELECT SUM(prize) as totalPrize, COUNT(*) as races
      FROM race_results
      WHERE horse_id = ?
    `).get(horse.mother_id) as { totalPrize: number } | undefined;

    const siblingsPrices = db.prepare(`
      SELECT AVG(price) as avgPrice, MAX(price) as maxPrice, MIN(price) as minPrice
      FROM foals f
      JOIN horses h ON f.horse_id = h.id
      WHERE (h.father_id = ? OR h.mother_id = ?) AND h.id != ? AND f.price IS NOT NULL
    `).get(horse.father_id, horse.mother_id, horseId) as { avgPrice: number } | undefined;

    const fatherPrize = fatherStats?.totalPrize || 0;
    const motherPrize = motherStats?.totalPrize || 0;
    const siblingsAvg = siblingsPrices?.avgPrice || 0;

    let basePrice = 500000; 

    basePrice += fatherPrize * 0.1;

    basePrice += motherPrize * 0.08;

    if (siblingsAvg > 0) {
      basePrice = (basePrice + siblingsAvg) / 2;
    }

    const age = new Date().getFullYear() - horse.birth_year;
    if (age <= 2) {
      basePrice *= 1.2; 
    } else if (age >= 5) {
      basePrice *= 0.8; 
    }

    if (horse.gender === 'stallion') {
      basePrice *= 1.3; 
    } else if (horse.gender === 'mare') {
      basePrice *= 1.1; 
    }

    const predictedPrice = Math.round(basePrice / 10000) * 10000; 

    let confidence = 'низкая';
    const factors = [];

    if (fatherPrize > 0) {
      factors.push(`Призовые отца: ${fatherPrize.toLocaleString('ru-RU')} ₽`);
    }
    if (motherPrize > 0) {
      factors.push(`Призовые матери: ${motherPrize.toLocaleString('ru-RU')} ₽`);
    }
    if (siblingsAvg > 0) {
      factors.push(`Средняя цена родственников: ${siblingsAvg.toLocaleString('ru-RU')} ₽`);
      confidence = 'средняя';
    }
    if (fatherPrize > 1000000 && siblingsAvg > 0) {
      confidence = 'высокая';
    }

    factors.push(`Пол: ${horse.gender === 'stallion' ? 'Жеребец' : horse.gender === 'mare' ? 'Кобыла' : 'Мерин'}`);
    factors.push(`Возраст: ${age} лет`);

    return {
      predictedPrice,
      confidence,
      factors
    };
  }
}

export const breedingService = new BreedingService();
