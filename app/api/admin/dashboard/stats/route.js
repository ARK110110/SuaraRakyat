import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Mengambil statistik laporan dan total user untuk Dashboard Admin
export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak: Hak akses tidak memadai' }, { status: 403 });
    }

    const [[{ total_reports }]] = await connection.query('SELECT COUNT(*) as total_reports FROM reports');
    const [[{ pending_reports }]] = await connection.query("SELECT COUNT(*) as pending_reports FROM reports WHERE status = 'pending'");
    const [[{ in_progress_reports }]] = await connection.query("SELECT COUNT(*) as in_progress_reports FROM reports WHERE status = 'in_progress'");
    const [[{ resolved_reports }]] = await connection.query("SELECT COUNT(*) as resolved_reports FROM reports WHERE status = 'resolved'");
    const [[{ total_users }]] = await connection.query('SELECT COUNT(*) as total_users FROM users');

    return NextResponse.json(
      {
        status: 'success',
        data: {
          total_reports,
          pending_reports,
          in_progress_reports,
          resolved_reports,
          total_users,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}