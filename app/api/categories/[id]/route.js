import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// PUT: Memperbarui kategori (Khusus Admin)
export async function PUT(req, context) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak: Hak akses tidak memadai' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { category_name, description } = body;

    const [categories] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return NextResponse.json({ status: 'error', message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    await connection.query(
      'UPDATE categories SET category_name = ?, description = ? WHERE id = ?',
      [category_name, description, id]
    );

    return NextResponse.json({ status: 'success', message: 'Kategori berhasil diperbarui' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

// DELETE: Menghapus kategori (Khusus Admin)
export async function DELETE(req, context) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak: Hak akses tidak memadai' }, { status: 403 });
    }

    const { id } = await context.params;

    const [categories] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return NextResponse.json({ status: 'error', message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    await connection.query('DELETE FROM categories WHERE id = ?', [id]);

    return NextResponse.json({ status: 'success', message: 'Kategori berhasil dihapus' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}