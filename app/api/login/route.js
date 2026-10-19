import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connection from '@/lib/db'; // sesuaikan path file koneksi MySQL kamu

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Login failed: Field email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'Login gagal: Email tidak terdaftar' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Cek password bcrypt
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json(
        { message: 'Login gagal: Password salah' },
        { status: 400 }
      );
    }

    // Sign Token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json(
      {
        message: 'Login Success',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}