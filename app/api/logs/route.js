import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/config/cloudinary'; // sesuaikan path konfigurasi cloudinary kamu

export async function POST(req) {
  try {
    const user = verifyAuth(req); // atau jwt.verify dari header
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // --- TAMBAHKAN VALIDASI ROLE TEGAS DI SINI ---
    if (user.role !== 'petugas' && user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Akses ditolak! Hanya petugas lapangan yang dapat menambah log progres.' },
        { status: 403 }
      );
    }

    // Mengambil data dari FormData (karena ada file upload)
    const formData = await req.formData();
    const report_id = formData.get('report_id');
    const message = formData.get('message');
    const file = formData.get('attachment');

    if (!report_id || !message) {
      return NextResponse.json(
        { status: 'error', message: 'Report ID dan pesan log wajib diisi' },
        { status: 400 }
      );
    }

    let attachment_url = null;

    // Jika ada file gambar yang dilampirkan
    if (file && typeof file === 'object' && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const cloudinaryResult = await uploadToCloudinary(buffer);
      attachment_url = cloudinaryResult.secure_url;
    }

    // Simpan ke tabel reports_logs (user_id diambil dari token secara aman)
    const [result] = await connection.query(
      'INSERT INTO reports_logs (report_id, user_id, message, attachment_url) VALUES (?, ?, ?, ?)',
      [report_id, user.id, message, attachment_url]
    );

    return NextResponse.json(
      {
        status: 'success',
        logId: result.insertId,
        attachment_url: attachment_url,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}