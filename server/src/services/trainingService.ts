import { db } from '../config/database.js';
import { Training, JockeyReport } from '../types/index.js';

export class TrainingService {
  getTrainings(filters: { horseId?: number; trainerId?: number; fromDate?: Date; toDate?: Date } = {}): any[] {
    let query = `
      SELECT t.*, h.name as horse_name, h.color as horse_color,
        u.first_name as trainer_first_name, u.last_name as trainer_last_name
      FROM trainings t
      JOIN horses h ON t.horse_id = h.id
      JOIN users u ON t.trainer_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (filters.horseId) {
      query += ' AND t.horse_id = ?';
      values.push(filters.horseId);
    }

    if (filters.trainerId) {
      query += ' AND t.trainer_id = ?';
      values.push(filters.trainerId);
    }

    if (filters.fromDate) {
      query += ' AND t.training_date >= ?';
      values.push(filters.fromDate.toISOString().split('T')[0]);
    }

    if (filters.toDate) {
      query += ' AND t.training_date <= ?';
      values.push(filters.toDate.toISOString().split('T')[0]);
    }

    query += ' ORDER BY t.training_date DESC, t.created_at DESC';

    const rows = db.prepare(query).all(...values);
    return rows as any[];
  }

  createTraining(training: Omit<Training, 'id' | 'createdAt'>): Training {
    const result = db.prepare(
      'INSERT INTO trainings (horse_id, trainer_id, training_date, type, duration, intensity, horse_condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      training.horseId,
      training.trainerId,
      training.date,
      training.type,
      training.duration,
      training.intensity,
      training.horseCondition,
      training.notes || null
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM trainings WHERE id = ?').get(id);
    return row as Training;
  }

  updateTraining(id: number, training: Partial<Training>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (training.date) { fields.push('training_date = ?'); values.push(training.date); }
    if (training.type) { fields.push('type = ?'); values.push(training.type); }
    if (training.duration) { fields.push('duration = ?'); values.push(training.duration); }
    if (training.intensity) { fields.push('intensity = ?'); values.push(training.intensity); }
    if (training.horseCondition) { fields.push('horse_condition = ?'); values.push(training.horseCondition); }
    if (training.notes !== undefined) { fields.push('notes = ?'); values.push(training.notes); }

    if (fields.length === 0) return false;

    values.push(id);
    const result = db.prepare(`UPDATE trainings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return result.changes > 0;
  }

  deleteTraining(id: number): boolean {
    const result = db.prepare('DELETE FROM trainings WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getTrainingStats(horseId: number): any {
    const totalTrainings = db.prepare(
      'SELECT COUNT(*) as count FROM trainings WHERE horse_id = ?'
    ).get(horseId) as { count: number } | undefined;

    const intensityStats = db.prepare(`
      SELECT 
        intensity,
        COUNT(*) as count,
        AVG(duration) as avg_duration
      FROM trainings
      WHERE horse_id = ?
      GROUP BY intensity
    `).all(horseId);

    const recentTrainings = db.prepare(`
      SELECT * FROM trainings
      WHERE horse_id = ?
      ORDER BY training_date DESC
      LIMIT 10
    `).all(horseId);

    return {
      total: totalTrainings?.count || 0,
      byIntensity: intensityStats,
      recent: recentTrainings
    };
  }

  getJockeyReports(filters: { raceId?: number; horseId?: number; jockeyId?: number } = {}): any[] {
    let query = `
      SELECT jr.*, h.name as horse_name, r.name as race_name, r.date as race_date,
        u.first_name as jockey_first_name, u.last_name as jockey_last_name
      FROM jockey_reports jr
      JOIN horses h ON jr.horse_id = h.id
      JOIN races r ON jr.race_id = r.id
      JOIN users u ON jr.jockey_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (filters.raceId) {
      query += ' AND jr.race_id = ?';
      values.push(filters.raceId);
    }

    if (filters.horseId) {
      query += ' AND jr.horse_id = ?';
      values.push(filters.horseId);
    }

    if (filters.jockeyId) {
      query += ' AND jr.jockey_id = ?';
      values.push(filters.jockeyId);
    }

    query += ' ORDER BY jr.created_at DESC';

    const rows = db.prepare(query).all(...values);
    return rows as any[];
  }

  createJockeyReport(report: Omit<JockeyReport, 'id' | 'createdAt'>): JockeyReport {
    const result = db.prepare(
      'INSERT INTO jockey_reports (race_id, horse_id, jockey_id, start_behavior, distance_behavior, finish_behavior, finish_condition, equipment_notes, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      report.raceId,
      report.horseId,
      report.jockeyId,
      report.startBehavior,
      report.distanceBehavior,
      report.finishBehavior,
      report.horseCondition,
      report.equipmentNotes || null,
      report.recommendations || null
    );

    const id = result.lastInsertRowid as number;
    const row = db.prepare('SELECT * FROM jockey_reports WHERE id = ?').get(id);
    return row as JockeyReport;
  }

  getTacticalInfo(raceId: number, horseId: number): any {

    const trainings = db.prepare(`
      SELECT * FROM trainings
      WHERE horse_id = ?
      ORDER BY training_date DESC
      LIMIT 5
    `).all(horseId);

    const restrictions = db.prepare(`
      SELECT restrictions FROM medical_records
      WHERE horse_id = ? AND restrictions IS NOT NULL
      ORDER BY record_date DESC
      LIMIT 1
    `).get(horseId) as { restrictions: string } | undefined;

    const lastReport = db.prepare(`
      SELECT * FROM jockey_reports
      WHERE horse_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(horseId);

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_races,
        AVG(position) as avg_position,
        SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) as wins
      FROM race_results
      WHERE horse_id = ?
    `).get(horseId);

    return {
      recentTrainings: trainings,
      restrictions: restrictions?.restrictions || null,
      lastReport: lastReport || null,
      stats: stats || null
    };
  }
}

export const trainingService = new TrainingService();
