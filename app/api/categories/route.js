import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Mengambil semua kategori (Dapat diakses semua user yang terautentikasi)
export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    const [rows] = await connection.query('SELECT * FROM categories');
    return NextResponse.json({ status: 'success', data: rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

// POST: Membuat kategori baru (Khusus Admin)
export async function POST(req) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak: Hak akses tidak memadai' }, { status: 403 });
    }

    const body = await req.json();
    const { category_name, description } = body;

    if (!category_name) {
      return NextResponse.json({ status: 'error', message: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const [result] = await connection.query(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name, description]
    );

    return NextResponse.json({ status: 'success', categoryId: result.insertId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}