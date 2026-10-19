import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// PATCH: Memperbarui role pengguna (Khusus Admin)
export async function PATCH(req, context) {
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
    const { role } = body;

    if (!['admin', 'petugas', 'pelapor'].includes(role)) {
      return NextResponse.json({ status: 'error', message: 'Role tidak valid' }, { status: 400 });
    }

    // Mencegah admin mengubah rolenya sendiri
    if (Number(id) === Number(user.id)) {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak: Anda tidak dapat mengubah role akun Anda sendiri' }, { status: 403 });
    }

    await connection.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    return NextResponse.json({ status: 'success', message: 'User role updated successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}