import { db } from '../config/database.js';
import { MedicalRecord, Vaccination } from '../types/index.js';

export class MedicalService {
  getMedicalRecords(horseId: number): any[] {
    try {
      const rows = db.prepare(`
        SELECT mr.*, u.first_name as vet_first_name, u.last_name as vet_last_name
        FROM medical_records mr
        LEFT JOIN users u ON mr.veterinarian_id = u.id
        WHERE mr.horse_id = ?
        ORDER BY mr.date DESC
      `).all(horseId);
      return rows as any[];
    } catch (error) {
      console.error('Error in getMedicalRecords:', error);
      return [];
    }
  }

  createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'createdAt'>): MedicalRecord {
    const result = db.prepare(
      'INSERT INTO medical_records (horse_id, veterinarian_id, record_type, date, description, diagnosis, treatment, status, medications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      record.horseId,
      record.veterinarianId,
      record.record_type || 'routine',
      record.date instanceof Date ? record.date.toISOString().split('T')[0] : record.date,
      record.description,
      record.diagnosis || null,
      record.treatment || null,
      record.restrictions || 'none',
      record.medications || null
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(id);
    return row as MedicalRecord;
  }

  updateMedicalRecord(id: number, record: Partial<MedicalRecord>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (record.record_type) { fields.push('record_type = ?'); values.push(record.record_type); }
    if (record.description) { fields.push('description = ?'); values.push(record.description); }
    if (record.diagnosis !== undefined) { fields.push('diagnosis = ?'); values.push(record.diagnosis); }
    if (record.treatment !== undefined) { fields.push('treatment = ?'); values.push(record.treatment); }
    if (record.medications !== undefined) { fields.push('medications = ?'); values.push(record.medications); }
    if (record.restrictions !== undefined) { fields.push('restrictions = ?'); values.push(record.restrictions); }
    if (record.status !== undefined) { fields.push('status = ?'); values.push(record.status); }

    if (fields.length === 0) return false;

    values.push(id);
    const result = db.prepare(`UPDATE medical_records SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return result.changes > 0;
  }

  deleteMedicalRecord(id: number): boolean {
    const result = db.prepare('DELETE FROM medical_records WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getVaccinations(horseId: number): any[] {
    try {
      const rows = db.prepare(`
        SELECT v.*, u.first_name as vet_first_name, u.last_name as vet_last_name
        FROM vaccinations v
        LEFT JOIN users u ON v.veterinarian_id = u.id
        WHERE v.horse_id = ?
        ORDER BY v.date DESC
      `).all(horseId);
      return rows as any[];
    } catch (error) {
      console.error('Error in getVaccinations:', error);
      return [];
    }
  }

  createVaccination(vaccination: Omit<Vaccination, 'id' | 'createdAt'>): Vaccination {
    const result = db.prepare(
      'INSERT INTO vaccinations (horse_id, name, date, next_date, veterinarian_id, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      vaccination.horseId,
      vaccination.name,
      vaccination.date instanceof Date ? vaccination.date.toISOString().split('T')[0] : vaccination.date,
      vaccination.nextDate ? (vaccination.nextDate instanceof Date ? vaccination.nextDate.toISOString().split('T')[0] : vaccination.nextDate) : null,
      vaccination.veterinarianId,
      vaccination.notes || null
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(id);
    return row as Vaccination;
  }

  getUpcomingVaccinations(userId?: number): any[] {
    let query = `
      SELECT v.*, h.name as horse_name, u.first_name as vet_first_name, u.last_name as vet_last_name
      FROM vaccinations v
      JOIN horses h ON v.horse_id = h.id
      JOIN users u ON v.veterinarian_id = u.id
      WHERE v.next_date IS NOT NULL AND v.next_date >= date('now')
    `;
    const values: any[] = [];

    if (userId) {
      query += ' AND (h.owner_id = ? OR h.trainer_id = ? OR v.veterinarian_id = ?)';
      values.push(userId, userId, userId);
    }

    query += ' ORDER BY v.next_date ASC LIMIT 20';

    const rows = db.prepare(query).all(...values);
    return rows as any[];
  }

  getRestrictions(horseId: number): string | null {
    const row = db.prepare(`
      SELECT restrictions FROM medical_records
      WHERE horse_id = ? AND restrictions IS NOT NULL AND restrictions != ''
      ORDER BY date DESC
      LIMIT 1
    `).get(horseId) as { restrictions: string } | undefined;

    return row?.restrictions || null;
  }

  getMedicalStats(horseId: number): any {
    const recordsCount = db.prepare(
      'SELECT COUNT(*) as count FROM medical_records WHERE horse_id = ?'
    ).get(horseId) as { count: number } | undefined;

    const vaccinationsCount = db.prepare(
      'SELECT COUNT(*) as count FROM vaccinations WHERE horse_id = ?'
    ).get(horseId) as { count: number } | undefined;

    const lastCheckup = db.prepare(`
      SELECT date FROM medical_records
      WHERE horse_id = ? AND record_type = 'Плановый осмотр'
      ORDER BY date DESC
      LIMIT 1
    `).get(horseId) as { date: string } | undefined;

    return {
      totalRecords: recordsCount?.count || 0,
      totalVaccinations: vaccinationsCount?.count || 0,
      lastCheckup: lastCheckup?.date || null
    };
  }
}

export const medicalService = new MedicalService();
