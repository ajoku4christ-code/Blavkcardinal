import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (existingAdmin) {
      db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(passwordHash, username);
    } else {
      db.prepare('INSERT OR REPLACE INTO admins (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
    }

    return NextResponse.json({ success: true, message: 'Admin credentials updated successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    );
  }
}
