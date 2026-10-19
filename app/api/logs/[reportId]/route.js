import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, context) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    const { reportId } = await context.params;

    const [rows] = await connection.query(
      `SELECT l.*, u.username 
       FROM reports_logs l 
       JOIN users u ON l.user_id = u.id 
       WHERE l.report_id = ?`,
      [reportId]
    );

    return NextResponse.json(
      { status: 'success', data: rows },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}