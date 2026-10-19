"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PelaporDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [logs, setLogs] = useState([]);

  // Modal State & Form Input
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  // UI State & Filtering
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3200);
  };

  // 1. Proteksi Autentikasi & Cek Hak Akses Role (Khusus Pelapor)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      router.replace("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== "pelapor") {
        setIsRestricted(true);
        setUser(parsedUser);
        return;
      }

      setToken(savedToken);
      setUser(parsedUser);
    } catch (e) {
      localStorage.clear();
      router.replace("/");
    }
  }, [router]);

  // 2. Fetch Data Laporan & Kategori dari Next.js API Routes Internal
  const fetchData = async (currentToken) => {
    try {
      const headers = { Authorization: `Bearer ${currentToken}` };
      const [resReports, resCategories] = await Promise.all([
        fetch("/api/reports", { headers }),
        fetch("/api/categories", { headers }),
      ]);

      if (resReports.ok) {
        const data = await resReports.json();
        setReports(data.data || []);
      }
      if (resCategories.ok) {
        const data = await resCategories.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat data dari server:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token]);

  // 3. Ambil Log / Bukti Kerja Berdasarkan Report ID
  const handleSelectReport = async (report) => {
    setSelectedReport(report);
    try {
      const res = await fetch(`/api/logs/${report.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil log laporan:", err);
    }
  };

  // 4. Kirim Laporan Baru (POST /api/reports dengan FormData & Upload Cloudinary)
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category_id", categoryId);
      formData.append("description", description);
      if (file) {
        formData.append("attachment", file);
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        showToast(`Laporan berhasil dikirim! ID: #${result.reportId}`);
        setShowNewReportModal(false);
        setTitle("");
        setCategoryId("");
        setDescription("");
        setFile(null);
        fetchData(token);
      } else {
        showToast(result.message || "Gagal mengirim laporan");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi server");
    } finally {
      setLoading(false);
    }
  };

  // 5. Hapus Laporan (Hanya jika status masih pending)
  const handleDeleteReport = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (res.ok) {
        showToast("Laporan berhasil dihapus");
        if (selectedReport?.id === id) setSelectedReport(null);
        fetchData(token);
      } else {
        showToast(result.message || "Gagal menghapus laporan");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi server");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/");
  };

  // Filter laporan berdasarkan tab status & kata kunci pencarian
  const filteredReports = reports.filter((r) => {
    const matchStatus =
      activeTab === "semua" ||
      r.status?.toLowerCase() === activeTab.toLowerCase();
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.category_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (isRestricted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Restricted Page (Akses Ditolak)
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Akun Anda terdeteksi sebagai{" "}
            <span className="text-amber-400 font-semibold uppercase">
              {user?.role}
            </span>
            . Halaman ini khusus diperuntukkan bagi Warga / Pelapor.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() =>
                router.replace(
                  user?.role === "petugas"
                    ? "/staff-dashboard"
                    : "/admin-dashboard",
                )
              }
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              Menuju Dashboard Anda
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium transition-all">
          {toastMessage}
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0f2942] flex items-center justify-center text-amber-400 font-bold shadow-sm">
              SR
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#0f2942] tracking-tight">
                SuaraRakyat
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Dashboard Pelapor (Warga)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">
                {user.username}
              </p>
              <p className="text-[11px] font-semibold text-amber-600 capitalize">
                {user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Split Section */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            {/* Citizen Help Banner */}
            <div className="bg-[#0f2942] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Layanan Aspirasi Publik Terpadu
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Kawal Pembangunan &amp; Fasilitas Kota
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                  Laporkan masalah infrastruktur atau fasilitas umum. Pantau
                  status penanganan aduan Anda secara real-time.
                </p>
              </div>
              <button
                onClick={() => setShowNewReportModal(true)}
                className="relative z-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm px-5 py-3 rounded-xl transition shadow-md shrink-0 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Buat Laporan Baru</span>
              </button>
            </div>

            {/* Filter Status Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                {[
                  { label: "Semua", value: "semua" },
                  { label: "Pending", value: "pending" },
                  { label: "In Progress", value: "in_progress" },
                  { label: "Resolved", value: "resolved" },
                  { label: "Rejected", value: "rejected" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                      activeTab === tab.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Cari judul aduan atau deskripsi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-72 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] transition shadow-sm"
                />
              </div>
            </div>

            {/* Primary Reports Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Judul &amp; Kategori</th>
                      <th className="py-3.5 px-5">Deskripsi Singkat</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Petugas Penanggung Jawab</th>
                      <th className="py-3.5 px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-12 text-center text-slate-400 text-sm"
                        >
                          Belum ada laporan pengaduan ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900 line-clamp-1">
                              {r.title}
                            </div>
                            <div className="text-xs font-semibold text-slate-500 mt-0.5">
                              {r.category_name}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-700 font-medium text-xs">
                            <div className="line-clamp-1">{r.description}</div>
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                r.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : r.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : r.status === "resolved"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {r.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-700 text-xs font-semibold">
                            {r.assignee_name || (
                              <span className="text-slate-400 italic font-normal">
                                Belum ditugaskan
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right space-x-2">
                            <button
                              onClick={() => handleSelectReport(r)}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-lg text-xs transition shadow-sm"
                            >
                              Detail Log
                            </button>
                            {r.status === "pending" && (
                              <button
                                onClick={() => handleDeleteReport(r.id)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-lg text-xs transition shadow-sm"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Interactive Detail Sidebar Drawer (Right Side) */}
          {selectedReport && (
            <div className="w-full sm:w-96 border-l border-slate-200 bg-white flex flex-col h-full shadow-2xl shrink-0 z-20">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Tiket #{selectedReport.id}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Detail Laporan
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Judul Aduan
                  </h4>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedReport.title}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Kategori
                  </h4>
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedReport.category_name}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Deskripsi
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedReport.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Lampiran Foto
                  </h4>
                  {selectedReport.attachment_url ? (
                    <img
                      src={selectedReport.attachment_url}
                      alt="Lampiran Pengaduan"
                      className="rounded-xl border border-slate-200 max-h-48 w-full object-cover shadow-sm"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Tidak ada lampiran foto.
                    </p>
                  )}
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-3">
                    Riwayat Log / Bukti Kerja Petugas
                  </h4>
                  {logs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      Belum ada pembaruan log atau progres dari petugas
                      lapangan.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 shadow-sm"
                        >
                          <div className="flex justify-between items-center text-slate-500 text-[11px]">
                            <span className="font-bold text-slate-800">
                              {log.username}
                            </span>
                            <span>
                              {new Date(log.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-normal">
                            {log.message}
                          </p>
                          {log.attachment_url && (
                            <img
                              src={log.attachment_url}
                              alt="Bukti Lapangan"
                              className="mt-2 rounded-lg border border-slate-200 max-h-32 w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Laporan Baru */}
      {showNewReportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Buat Laporan Aduan Baru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sampaikan keluhan fasilitas publik atau infrastruktur kota.
                </p>
              </div>
              <button
                onClick={() => setShowNewReportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Aduan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Lampu Jalan Padam di Jl. Merdeka"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Laporan
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Detail
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Jelaskan kondisi kerusakan, lokasi spesifik, dan potensi bahaya bagi warga..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lampiran Foto Bukti
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2942] file:text-white hover:file:bg-slate-800 transition"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#0f2942] hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition shadow-md disabled:opacity-50"
                >
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
