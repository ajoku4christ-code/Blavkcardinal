import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const db = new Database('party.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    payment_method TEXT DEFAULT 'bank_transfer',
    payment_status TEXT DEFAULT 'pending',
    stripe_payment_id TEXT,
    bank_transfer_proof TEXT,
    ticket_id TEXT UNIQUE,
    qr_code_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function ensureAdmin() {
  try {
    const adminExists = db.prepare('SELECT COUNT(*) as count FROM admins WHERE username = ?').get('admin') as { count: number };
    if (adminExists.count === 0) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
    }
  } catch (e) {
  }
}

export function createGuest(data: { fullName: string; email: string; phone: string; paymentMethod: string }) {
  const ticketId = `EHP-${uuidv4().slice(0, 8).toUpperCase()}`;
  
  const stmt = db.prepare(`
    INSERT INTO guests (full_name, email, phone, payment_method, ticket_id, payment_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);
  
  const result = stmt.run(data.fullName, data.email, data.phone, data.paymentMethod, ticketId);
  return { id: result.lastInsertRowid, ticketId };
}

export function getGuestByEmail(email: string) {
  return db.prepare('SELECT * FROM guests WHERE email = ?').get(email);
}

export function getGuestByTicketId(ticketId: string) {
  return db.prepare('SELECT * FROM guests WHERE ticket_id = ?').get(ticketId);
}

export function updatePaymentStatus(id: number, status: string, stripePaymentId?: string) {
  if (stripePaymentId) {
    db.prepare('UPDATE guests SET payment_status = ?, stripe_payment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, stripePaymentId, id);
  } else {
    db.prepare('UPDATE guests SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, id);
  }
}

export function updateBankTransferProof(id: number, proofPath: string) {
  db.prepare('UPDATE guests SET bank_transfer_proof = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(proofPath, 'pending', id);
}

export function getAllGuests(status?: string) {
  if (status && status !== 'all') {
    return db.prepare('SELECT * FROM guests WHERE payment_status = ? ORDER BY created_at DESC').all(status);
  }
  return db.prepare('SELECT * FROM guests ORDER BY created_at DESC').all();
}

export function getGuestCount() {
  const result = db.prepare('SELECT COUNT(*) as count FROM guests WHERE payment_status = ?').get('paid') as { count: number };
  return result.count;
}

export function getTotalRevenue() {
  const result = db.prepare('SELECT COUNT(*) as count FROM guests WHERE payment_status = ?').get('paid') as { count: number };
  return result.count * 10000;
}

export function getGuestById(id: number) {
  return db.prepare('SELECT * FROM guests WHERE id = ?').get(id);
}

export function updateGuestQRCode(id: number, qrCodeData: string) {
  db.prepare('UPDATE guests SET qr_code_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(qrCodeData, id);
}

export function adminLogin(username: string, password: string) {
  ensureAdmin();
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as { id: number; username: string; password_hash: string } | undefined;
  if (!admin) return null;
  const valid = bcrypt.compareSync(password, admin.password_hash);
  return valid ? { id: admin.id, username: admin.username } : null;
}

export { db };
