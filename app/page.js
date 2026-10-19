'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Panggil Next.js Route Handler di /api/login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal, periksa kembali email dan password.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Arahkan ke dashboard yang sesuai berdasarkan role user
      const userRole = data.user.role;
      if (userRole === 'pelapor') {
        router.push('/dashboard');
      } else if (userRole === 'petugas') {
        router.push('/staff-dashboard');
      } else if (userRole === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white font-sans text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* Left Column: Visual & Civic Branding Experience (Full Height) */}
      <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-12 lg:p-16 text-white overflow-hidden bg-[#0f2942]">
        <img
          src="/thumbnailAuth.png"
          alt="Pelayanan Warga SuaraRakyat"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081726]/95 via-[#0f2942]/60 to-[#0f2942]/40"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span className="text-xs font-semibold tracking-wide uppercase text-white/95">Portal Aspirasi Resmi</span>
          </div>
          <span className="text-xs font-medium text-white/70 bg-white/10 px-2.5 py-1 rounded-md border border-white/10">SP4N Terpadu</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Transparan &amp; Akuntabel
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-snug text-white">
            Satu Suara untuk Perubahan Kota yang Lebih Baik.
          </h2>
          <p className="text-sm xl:text-base text-slate-200 font-normal leading-relaxed">
            Kanal pelaporan terpadu menghubungkan langsung aduan infrastruktur dan layanan sipil Anda ke dinas berwenang.
          </p>
          <div className="pt-6 border-t border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <span className="text-xs xl:text-sm text-slate-200 font-medium">Terintegrasi dengan 24+ Dinas &amp; Pemprov</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          © 2026 Pemerintah Kota. Hak cipta dilindungi undang-undang.
        </div>
      </div>

      {/* Right Column: Pure Clean Login Form (Full Height) */}
      <div className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 lg:p-20 bg-white min-h-screen">
        <div className="w-full max-w-xl mx-auto flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0f2942] flex items-center justify-center text-white shadow-md shadow-[#0f2942]/20">
              <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#0f2942]">SuaraRakyat</h1>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aspirasi Warga Cerdas</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl mx-auto my-auto py-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Masuk ke Akun</h2>
            <p className="text-sm text-slate-500 mt-1.5">Selamat datang kembali! Silakan masukkan detail akun warga Anda.</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#eff4ff]/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Kata Sandi</label>
                <a href="#" className="text-xs font-semibold text-amber-600 hover:text-amber-700">Lupa Kata Sandi?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full pl-10 pr-11 py-3 bg-[#eff4ff]/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0f2942] rounded border-slate-300 focus:ring-[#0f2942]" />
                <span className="text-xs text-slate-600 font-medium">Ingat sesi saya di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'Memproses Masuk...' : 'Masuk ke Dashboard Aspirasi'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </form>
        </div>

        <div className="w-full max-w-xl mx-auto pt-5 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Belum punya akun warga?{' '}
            <Link href="/register" className="font-bold text-[#0f2942] hover:text-amber-600 transition underline underline-offset-2">Daftar Akun Baru</Link>
          </p>
        </div>
      </div>
    </div>
  );
}