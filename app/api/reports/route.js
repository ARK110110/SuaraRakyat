import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/config/cloudinary';

export async function GET(request) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Akses ditolak, token tidak valid' }, { status: 401 });
    }

    let query = `
      SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.status, 
        r.attachment_url, 
        r.created_at,
        r.assignee_id, -- <-- PASTIKAN KOLOM INI IKUT DITARIK
        u.username AS reporter_name,
        p.username AS assignee_name,
        c.category_name
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users p ON r.assignee_id = p.id
      LEFT JOIN categories c ON r.category_id = c.id
    `;

    let queryParams = [];

    // Jika role-nya pelapor, batasi hanya laporan miliknya sendiri
    if (user.role === 'pelapor') {
      query += ` WHERE r.reporter_id = ?`;
      queryParams.push(user.id);
    } 
    // Jika role-nya petugas, batasi hanya laporan yang di-assign ke dia
    else if (user.role === 'petugas') {
      query += ` WHERE r.assignee_id = ?`;
      queryParams.push(user.id);
    }
    // Jika admin, tampilkan semua tanpa WHERE (bisa diurutkan berdasarkan tanggal terbaru)

    query += ` ORDER BY r.created_at DESC`;

    const [rows] = await connection.query(query, queryParams);

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: error.message },
      { status: 500 }
    );
  }
}

// POST: Membuat laporan baru (Khusus Pelapor & Admin)
export async function POST(req) {
  try {
    const user = verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Access token required' }, { status: 401 });
    }

    if (!['pelapor', 'admin'].includes(user.role)) {
      return NextResponse.json({ status: 'error', message: 'Akses ditolak' }, { status: 403 });
    }

    const formData = await req.formData();
    const category_id = formData.get('category_id');
    const title = formData.get('title');
    const description = formData.get('description');
    const file = formData.get('attachment');

    if (!category_id || !title || !description) {
      return NextResponse.json(
        { status: 'error', message: 'Field kategori, judul, dan deskripsi wajib diisi' },
        { status: 400 }
      );
    }

    let attachment_url = null;
    if (file && typeof file === 'object' && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const cloudinaryResult = await uploadToCloudinary(buffer);
      attachment_url = cloudinaryResult.secure_url;
    }

    const [result] = await connection.query(
      'INSERT INTO reports (reporter_id, category_id, title, description, attachment_url) VALUES (?, ?, ?, ?, ?)',
      [user.id, category_id, title, description, attachment_url]
    );

    return NextResponse.json(
      {
        status: 'success',
        reportId: result.insertId,
        attachment_url: attachment_url,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}