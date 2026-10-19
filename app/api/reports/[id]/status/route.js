import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// PATCH: Memperbarui status dan/atau assignee petugas (Admin / Petugas)
export async function PATCH(req, context) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    if (!['admin', 'petugas'].includes(user.role)) {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { status, assignee_id } = body;

    await connection.query(
      'UPDATE reports SET status = ?, assignee_id = ? WHERE id = ?',
      [status, assignee_id !== undefined ? assignee_id : null, id]
    );

    return NextResponse.json({ status: 'success', message: 'Report status updated' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}