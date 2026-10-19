import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Mengambil daftar seluruh pengguna (Khusus Admin)
export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak: Hak akses tidak memadai' }, { status: 403 });
    }

    const [rows] = await connection.query('SELECT id, username, email, role, created_at FROM users');
    return NextResponse.json({ status: 'success', data: rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}