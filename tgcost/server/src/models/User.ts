import { pool } from '../config/database';
import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async findAll(): Promise<User[]> {
    const [rows] = await pool.execute('SELECT id, email, name, role, avatar, phone, company, status, created_at, updated_at FROM users');
    return rows as User[];
  }

  static async findById(id: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, avatar, phone, company, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO users (id, email, password, name, role, avatar, phone, company, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userData.email, userData.password, userData.name, userData.role, userData.avatar ?? null, userData.phone ?? null, userData.company ?? null, userData.status]
    );
    return this.findById(id) as Promise<User>;
  }

  static async update(id: string, updates: Partial<User>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.email) { fields.push('email = ?'); values.push(updates.email); }
    if (updates.password) { fields.push('password = ?'); values.push(updates.password); }
    if (updates.avatar) { fields.push('avatar = ?'); values.push(updates.avatar); }
    if (updates.phone) { fields.push('phone = ?'); values.push(updates.phone); }
    if (updates.company) { fields.push('company = ?'); values.push(updates.company); }
    if (updates.role) { fields.push('role = ?'); values.push(updates.role); }
    if (updates.status) { fields.push('status = ?'); values.push(updates.status); }

    if (fields.length === 0) return;

    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id: string): Promise<void> {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  static async count(): Promise<number> {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    return (rows as any[])[0].count;
  }
}
