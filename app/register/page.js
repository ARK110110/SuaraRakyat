"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      // Panggil Next.js Route Handler di /api/register
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal, silakan coba lagi.");
      }

      setSuccessMessage("Registrasi berhasil! Mengarahkan ke halaman login...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white font-sans text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Left Column: Civic Identity & Registration Benefit (Full Height) */}
      <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-12 lg:p-16 text-white overflow-hidden bg-[#0f2942]">
        <img
          src="/thumbnailAuth.png"
          alt="Partisipasi Warga SuaraRakyat"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081726]/95 via-[#0f2942]/60 to-[#0f2942]/40"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            <svg
              className="w-4 h-4 text-emerald-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-semibold tracking-wide uppercase text-white/95">
              Registrasi Warga Resmi
            </span>
          </div>
          <span className="text-xs font-medium text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-400/30">
            Dukcapil Ready
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Perlindungan Data Pelapor Terjamin
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-snug text-white">
            Daftar Sekali, Kawal Pembangunan Selamanya.
          </h2>
          <ul className="space-y-3 text-xs xl:text-sm text-slate-200">
            <li className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-amber-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                Tracking status pengerjaan aduan secara <em>real-time</em>
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-amber-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Opsi pelaporan anonim &amp; rahasia terlindungi</span>
            </li>
            <li className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-amber-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Notifikasi berkala via Email warga</span>
            </li>
          </ul>
          <div className="pt-6 border-t border-white/15">
            <p className="text-xs text-slate-300 leading-normal">
              Sesuai standar UU Pelindungan Data Pribadi (UU PDP No. 27/2022).
              Keamanan dan kerahasiaan akun terjamin.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          © 2026 Pemerintah Kota. Hak cipta dilindungi undang-undang.
        </div>
      </div>

      {/* Right Column: Pure Clean Register Form (Full Height) */}
      <div className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 lg:p-20 bg-white min-h-screen">
        <div className="w-full max-w-xl mx-auto flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0f2942] flex items-center justify-center text-white shadow-md shadow-[#0f2942]/20">
              <svg
                className="w-5 h-5 text-amber-400 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#0f2942]">
                SuaraRakyat
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Aspirasi Warga Cerdas
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-[#0f2942] transition flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Login
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto my-auto py-6">
          <div className="mb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftar Akun Baru
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Lengkapi data diri untuk mulai menyampaikan aspirasi dan
              pengaduan.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
              {successMessage}
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Nama Pengguna / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Alife Maalik"
                className="w-full px-3.5 py-2.5 bg-[#eff4ff]/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Alamat Email Aktif
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama.anda@email.com"
                className="w-full px-3.5 py-2.5 bg-[#eff4ff]/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="w-full px-3.5 py-2.5 bg-[#eff4ff]/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full px-3.5 py-2.5 bg-[#eff4ff]/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 text-[#0f2942] rounded border-slate-300 focus:ring-[#0f2942]"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Saya menyetujui{" "}
                  <a
                    href="#"
                    className="text-[#0f2942] font-semibold hover:underline"
                  >
                    Syarat &amp; Ketentuan Layanan
                  </a>{" "}
                  serta{" "}
                  <a
                    href="#"
                    className="text-[#0f2942] font-semibold hover:underline"
                  >
                    Kebijakan Perlindungan Data Warga
                  </a>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.99] disabled:opacity-50"
            >
              <span>
                {loading
                  ? "Memproses Pendaftaran..."
                  : "Daftar Sekarang & Verifikasi"}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>
        </div>

        <div className="w-full max-w-xl mx-auto pt-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Sudah memiliki akun warga?{" "}
            <Link
              href="/"
              className="font-bold text-[#0f2942] hover:text-amber-600 transition underline underline-offset-2"
            >
              Masuk ke Akun Anda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
