import { db } from '../config/database.js';
import { User, UserRole } from '../types/index.js';
import { hashPassword } from '../utils/helpers.js';

export class UserService {
  findAll(): User[] {
    const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    return rows as User[];
  }

  findById(id: number): User | null {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row as User | null;
  }

  findByEmail(email: string): User | null {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return row as User | null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);

    const result = db.prepare(
      'INSERT INTO users (email, password, first_name, last_name, phone, role, avatar_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      userData.email, 
      hashedPassword, 
      userData.firstName, 
      userData.lastName, 
      userData.phone, 
      userData.role, 
      userData.avatarUrl, 
      userData.isActive ? 1 : 0
    );

    const id = result.lastInsertRowid as number;
    return this.findById(id) as User;
  }

  update(id: number, userData: Partial<User>): User | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (userData.firstName) { fields.push('first_name = ?'); values.push(userData.firstName); }
    if (userData.lastName) { fields.push('last_name = ?'); values.push(userData.lastName); }
    if (userData.phone) { fields.push('phone = ?'); values.push(userData.phone); }
    if (userData.avatarUrl) { fields.push('avatar_url = ?'); values.push(userData.avatarUrl); }
    if (userData.isActive !== undefined) { fields.push('is_active = ?'); values.push(userData.isActive ? 1 : 0); }
    if (userData.role) { fields.push('role = ?'); values.push(userData.role); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getStats(): any {
    const row = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role IN ('owner_private', 'owner_stud') THEN 1 ELSE 0 END) as owners,
        SUM(CASE WHEN role = 'trainer' THEN 1 ELSE 0 END) as trainers,
        SUM(CASE WHEN role = 'jockey' THEN 1 ELSE 0 END) as jockeys,
        SUM(CASE WHEN role = 'veterinarian' THEN 1 ELSE 0 END) as veterinarians
      FROM users
      WHERE is_active = 1
    `).get();
    return row;
  }

  getTrainers(): User[] {
    const rows = db.prepare(
      'SELECT id, first_name, last_name, email, phone, avatar_url FROM users WHERE role = ? AND is_active = 1'
    ).all(UserRole.TRAINER);
    return rows as User[];
  }

  getJockeys(): User[] {
    const rows = db.prepare(
      'SELECT id, first_name, last_name, email, phone, avatar_url FROM users WHERE role = ? AND is_active = 1'
    ).all(UserRole.JOCKEY);
    return rows as User[];
  }

  getVeterinarians(): User[] {
    const rows = db.prepare(
      'SELECT id, first_name, last_name, email, phone, avatar_url FROM users WHERE role = ? AND is_active = 1'
    ).all(UserRole.VETERINARIAN);
    return rows as User[];
  }
}

export const userService = new UserService();
