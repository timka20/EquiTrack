import { db } from '../config/database.js';

export class AnalyticsService {
  getOwnerAnalytics(ownerId: number): any {

    const prizeStats = db.prepare(`
      SELECT 
        SUM(rr.prize) as totalPrizes,
        COUNT(DISTINCT rr.race_id) as racesParticipated,
        SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END) as wins,
        CAST(strftime('%Y', r.date) AS INTEGER) as year
      FROM race_results rr
      JOIN races r ON rr.race_id = r.id
      JOIN horses h ON rr.horse_id = h.id
      WHERE h.owner_id = ?
      GROUP BY CAST(strftime('%Y', r.date) AS INTEGER)
      ORDER BY year DESC
    `).all(ownerId);

    const expenses = db.prepare(`
      SELECT 
        COUNT(DISTINCT t.id) * 5000 as training_expenses,
        COUNT(DISTINCT mr.id) * 3000 as medical_expenses
      FROM horses h
      LEFT JOIN trainings t ON h.id = t.horse_id
      LEFT JOIN medical_records mr ON h.id = mr.horse_id
      WHERE h.owner_id = ?
    `).get(ownerId);

    const horseStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_training' THEN 1 ELSE 0 END) as inTraining,
        SUM(CASE WHEN status = 'for_sale' THEN 1 ELSE 0 END) as forSale,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold
      FROM horses
      WHERE owner_id = ?
    `).get(ownerId);

    const topHorses = db.prepare(`
      SELECT h.name, SUM(rr.prize) as totalPrize,
        COUNT(*) as races,
        SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END) as wins
      FROM horses h
      JOIN race_results rr ON h.id = rr.horse_id
      WHERE h.owner_id = ?
      GROUP BY h.id
      ORDER BY totalPrize DESC
      LIMIT 5
    `).all(ownerId);

    return {
      prizes: prizeStats,
      expenses: expenses,
      horses: horseStats,
      topHorses
    };
  }

  getTrainerAnalytics(trainerId: number): any {

    const trainingStats = db.prepare(`
      SELECT 
        COUNT(*) as totalTrainings,
        AVG(duration) as avgDuration,
        intensity,
        COUNT(*) as count
      FROM trainings
      WHERE trainer_id = ?
      GROUP BY intensity
    `).all(trainerId);

    const raceStats = db.prepare(`
      SELECT 
        COUNT(DISTINCT rr.race_id) as totalRaces,
        SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN rr.position <= 3 THEN 1 ELSE 0 END) as podiums,
        AVG(rr.position) as avgPosition,
        SUM(rr.prize) as totalPrizes
      FROM race_results rr
      JOIN horses h ON rr.horse_id = h.id
      WHERE h.trainer_id = ?
    `).get(trainerId);

    const horses = db.prepare(`
      SELECT h.*, 
        COUNT(DISTINCT t.id) as trainingCount,
        COUNT(DISTINCT rr.race_id) as raceCount
      FROM horses h
      LEFT JOIN trainings t ON h.id = t.horse_id
      LEFT JOIN race_results rr ON h.id = rr.horse_id
      WHERE h.trainer_id = ?
      GROUP BY h.id
    `).all(trainerId);

    return {
      trainings: trainingStats,
      races: raceStats,
      horses
    };
  }

  getJockeyAnalytics(jockeyId: number): any {
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT rr.race_id) as totalRaces,
        SUM(CASE WHEN rr.position = 1 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN rr.position <= 3 THEN 1 ELSE 0 END) as podiums,
        AVG(rr.position) as avgPosition,
        SUM(rr.prize) as totalPrizes,
        COUNT(DISTINCT rr.horse_id) as uniqueHorses
      FROM race_results rr
      JOIN race_registrations rreg ON rr.race_id = rreg.race_id AND rr.horse_id = rreg.horse_id
      WHERE rreg.jockey_id = ?
    `).get(jockeyId);

    const recentRaces = db.prepare(`
      SELECT r.name, r.date, h.name as horse_name, rr.position, rr.prize
      FROM race_results rr
      JOIN races r ON rr.race_id = r.id
      JOIN horses h ON rr.horse_id = h.id
      JOIN race_registrations rreg ON rr.race_id = rreg.race_id AND rr.horse_id = rreg.horse_id
      WHERE rreg.jockey_id = ?
      ORDER BY r.date DESC
      LIMIT 10
    `).all(jockeyId);

    return {
      stats: stats,
      recentRaces
    };
  }

  getAdminAnalytics(): any {

    const userStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role IN ('owner_private', 'owner_stud') THEN 1 ELSE 0 END) as owners,
        SUM(CASE WHEN role = 'trainer' THEN 1 ELSE 0 END) as trainers,
        SUM(CASE WHEN role = 'jockey' THEN 1 ELSE 0 END) as jockeys,
        SUM(CASE WHEN role = 'veterinarian' THEN 1 ELSE 0 END) as vets
      FROM users
      WHERE is_active = 1
    `).get();

    const horseStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_training' THEN 1 ELSE 0 END) as inTraining,
        SUM(CASE WHEN status = 'for_sale' THEN 1 ELSE 0 END) as forSale,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold
      FROM horses
    `).get();

    const raceStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as finished,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(prize_fund) as totalPrizeFund
      FROM races
    `).get();

    const breedingStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pregnancy_confirmed' THEN 1 ELSE 0 END) as confirmed
      FROM breedings
    `).get();

    const salesStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
        SUM(price) as totalValue
      FROM foals
      WHERE price IS NOT NULL
    `).get();

    const monthlyPrizes = db.prepare(`
      SELECT 
        strftime('%Y-%m', r.date) as month,
        SUM(rr.prize) as totalPrize
      FROM race_results rr
      JOIN races r ON rr.race_id = r.id
      WHERE r.date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', r.date)
      ORDER BY month ASC
    `).all();

    return {
      users: userStats,
      horses: horseStats,
      races: raceStats,
      breedings: breedingStats,
      sales: salesStats,
      monthlyPrizes
    };
  }

  getDashboardStats(userId: number, role: string): any {
    const baseStats = {
      upcomingRaces: 0,
      unreadMessages: 0,
      unreadNotifications: 0,
      pendingTasks: 0
    };

    const upcomingRaces = db.prepare(`
      SELECT COUNT(*) as count FROM races
      WHERE date >= date('now') AND status IN ('scheduled', 'registration_open')
    `).get() as { count: number } | undefined;
    baseStats.upcomingRaces = upcomingRaces?.count || 0;

    const unreadMessages = db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0'
    ).get(userId) as { count: number } | undefined;
    baseStats.unreadMessages = unreadMessages?.count || 0;

    const unreadNotifications = db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
    ).get(userId) as { count: number } | undefined;
    baseStats.unreadNotifications = unreadNotifications?.count || 0;

    let pendingTasks = 0;

    if (role === 'admin') {
      const pendingRegs = db.prepare(
        "SELECT COUNT(*) as count FROM race_registrations WHERE status = 'pending'"
      ).get() as { count: number } | undefined;
      pendingTasks = pendingRegs?.count || 0;
    } else if (role === 'trainer') {
      const trainingTasks = db.prepare(`
        SELECT COUNT(*) as count FROM horses h
        WHERE h.trainer_id = ? AND h.status = 'in_training'
      `).get(userId) as { count: number } | undefined;
      pendingTasks = trainingTasks?.count || 0;
    } else if (role === 'veterinarian') {
      const vetTasks = db.prepare(`
        SELECT COUNT(*) as count FROM vaccinations
        WHERE next_date IS NOT NULL AND next_date <= date('now', '+7 days')
      `).get() as { count: number } | undefined;
      pendingTasks = vetTasks?.count || 0;
    }

    baseStats.pendingTasks = pendingTasks;

    return baseStats;
  }
}

export const analyticsService = new AnalyticsService();
