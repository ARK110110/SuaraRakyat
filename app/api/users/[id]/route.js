import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// DELETE: Menghapus pengguna (Khusus Admin)
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

    // Mencegah admin menghapus akunnya sendiri
    if (Number(id) === Number(user.id)) {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak: Anda tidak dapat menghapus akun Anda sendiri' }, { status: 403 });
    }

    await connection.query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ status: 'success', message: 'User deleted successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}