import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connection from '@/lib/db'; // sesuaikan path file koneksi MySQL kamu

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Field tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Hash Password
    const hashedPass = await bcrypt.hash(password, 10);

    // Insert user baru dengan role default 'pelapor'
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPass, 'pelapor']
    );

    return NextResponse.json(
      { status: 'success', userId: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}