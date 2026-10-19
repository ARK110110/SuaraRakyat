import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// PUT: Edit Laporan (Pelapor hanya bisa edit jika status masih 'pending')
export async function PUT(req, context) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { category_id, title, description } = body;

    const [reports] = await connection.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (reports.length === 0) {
      return NextResponse.json({ status: 'error', message: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const report = reports[0];
    if (user.role === 'pelapor') {
      if (report.reporter_id !== user.id) {
        return NextResponse.json({ status: 'error', message: 'Akses ditolak: Bukan laporan Anda' }, { status: 403 });
      }
      if (report.status !== 'pending') {
        return NextResponse.json({ status: 'error', message: 'Laporan tidak dapat diubah karena status bukan pending' }, { status: 400 });
      }
    }

    await connection.query(
      'UPDATE reports SET category_id = ?, title = ?, description = ? WHERE id = ?',
      [category_id, title, description, id]
    );

    return NextResponse.json({ status: 'success', message: 'Laporan berhasil diperbarui' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

// DELETE: Hapus Laporan
export async function DELETE(req, context) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    const { id } = await context.params;

    const [reports] = await connection.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (reports.length === 0) {
      return NextResponse.json({ status: 'error', message: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const report = reports[0];
    if (user.role === 'pelapor') {
      if (report.reporter_id !== user.id) {
        return NextResponse.json({ status: 'error', message: 'Akses ditolak: Bukan laporan Anda' }, { status: 403 });
      }
      if (report.status !== 'pending') {
        return NextResponse.json({ status: 'error', message: 'Laporan tidak dapat dihapus karena status bukan pending' }, { status: 400 });
      }
    }

    await connection.query('DELETE FROM reports WHERE id = ?', [id]);

    return NextResponse.json({ status: 'success', message: 'Laporan berhasil dihapus' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}