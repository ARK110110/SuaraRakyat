"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [logs, setLogs] = useState([]);

  // State Filter & Search
  const [activeTab, setActiveTab] = useState("semua");
  const [search, setSearch] = useState("");

  // State Form Log / Proof of Work
  const [logMessage, setLogMessage] = useState("");
  const [logFile, setLogFile] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3200);
  };

  // 1. Proteksi Autentikasi & Verifikasi Role Petugas
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      router.replace("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== "petugas") {
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

  // 2. Fetch Laporan Tugas Khusus Petugas Login (Next.js API Routes)
  const fetchPetugasReports = async (currentToken) => {
    try {
      const res = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.data || []);
      } else {
        showToast("Gagal memuat antrean laporan petugas");
      }
    } catch (err) {
      console.error("Error fetching petugas reports:", err);
      showToast("Koneksi server terputus");
    }
  };

  useEffect(() => {
    if (token) {
      fetchPetugasReports(token);
    }
  }, [token]);

  // 3. Ambil Log & Set State Detail Laporan
  const handleSelectReport = async (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
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

  // 4. Update Status Laporan
  const handleUpdateStatus = async (statusValue) => {
    if (!selectedReport) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: statusValue,
          assignee_id: user.id,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        showToast(
          `Status berhasil diperbarui menjadi ${statusValue.replace("_", " ")}`,
        );
        setNewStatus(statusValue);
        setSelectedReport((prev) => ({ ...prev, status: statusValue }));
        fetchPetugasReports(token);
      } else {
        showToast(result.message || "Gagal memperbarui status");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi server");
    } finally {
      setLoading(false);
    }
  };

  // 5. Tambah Log / Proof of Work Baru
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logMessage.trim()) {
      showToast("Pesan log tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("report_id", selectedReport.id);
      formData.append("message", logMessage);
      if (logFile) {
        formData.append("attachment", logFile);
      }

      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        showToast("Log progres pekerjaan berhasil ditambahkan!");
        setLogMessage("");
        setLogFile(null);
        // Refresh log list
        const resLogs = await fetch(`/api/logs/${selectedReport.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resLogs.ok) {
          const dataLogs = await resLogs.json();
          setLogs(dataLogs.data || []);
        }
      } else {
        showToast(result.message || "Gagal menambahkan log");
      }
    } catch (err) {
      showToast("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/");
  };

  // Filtering data
  const filteredReports = reports.filter((r) => {
    const matchStatus =
      activeTab === "semua" ||
      r.status?.toLowerCase() === activeTab.toLowerCase();
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.category_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.reporter_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (isRestricted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <h2 className="text-xl font-bold tracking-tight">
            Restricted Page (Akses Ditolak)
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Halaman ini khusus untuk Petugas Lapangan.
          </p>
          <button
            onClick={() => router.replace("/dashboard")}
            className="mt-6 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Kembali ke Dashboard Anda
          </button>
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
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f2942] flex items-center justify-center text-white shadow-md shadow-[#0f2942]/20">
              <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#0f2942] tracking-tight">
                SuaraRakyat
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Dashboard Petugas Lapangan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">
                {user.username}
              </p>
              <p className="text-[11px] font-semibold text-blue-600 capitalize">
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

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            {/* Banner Informasi Petugas */}
            <div className="bg-[#0f2942] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-semibold mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  Pusat Kendali Penanganan Aduan
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Antrean Tugas Penanganan Lapangan
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-1">
                  Perbarui status pengerjaan laporan dan unggah bukti pekerjaan
                  (*proof of work*) secara berkala.
                </p>
              </div>
            </div>

            {/* Filter Status Tabs & Search */}
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
                <input
                  type="text"
                  placeholder="Cari judul, pelapor, kategori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-72 pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2942] transition shadow-sm"
                />
              </div>
            </div>

            {/* Tabel Antrean Tugas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Tiket &amp; Judul</th>
                      <th className="py-3.5 px-5">Pelapor</th>
                      <th className="py-3.5 px-5">Kategori</th>
                      <th className="py-3.5 px-5">Status</th>
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
                          Tidak ada antrean tugas ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-4 px-5">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              #SR-{r.id}
                            </span>
                            <div className="font-bold text-slate-900 line-clamp-1">
                              {r.title}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-700 text-xs font-semibold">
                            {r.reporter_name}
                          </td>
                          <td className="py-4 px-5 text-slate-500 text-xs font-medium">
                            {r.category_name}
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
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => handleSelectReport(r)}
                              className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition shadow-sm"
                            >
                              Kelola Progres
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Drawer Kelola Progres (Sisi Kanan) */}
          {selectedReport && (
            <div className="w-full sm:w-[420px] border-l border-slate-200 bg-white flex flex-col h-full shadow-2xl shrink-0 z-20">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Tiket #SR-{selectedReport.id}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Kelola &amp; Update Progres
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Informasi Laporan */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">
                      Judul Aduan
                    </h4>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedReport.title}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">
                      Pelapor &amp; Kategori
                    </h4>
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedReport.reporter_name} •{" "}
                      <span className="text-slate-500">
                        {selectedReport.category_name}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">
                      Deskripsi
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                      {selectedReport.description}
                    </p>
                  </div>
                  {selectedReport.attachment_url && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Foto Lokasi Pelapor
                      </h4>
                      <img
                        src={selectedReport.attachment_url}
                        alt="Aduan"
                        className="rounded-lg max-h-40 w-full object-cover border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                {/* Ubah Status Penanganan */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Ubah Status Penanganan
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: "pending",
                        label: "Pending",
                        color:
                          "hover:bg-amber-50 text-amber-700 border-amber-200",
                      },
                      {
                        value: "in_progress",
                        label: "In Progress",
                        color: "hover:bg-blue-50 text-blue-700 border-blue-200",
                      },
                      {
                        value: "resolved",
                        label: "Resolved",
                        color:
                          "hover:bg-emerald-50 text-emerald-700 border-emerald-200",
                      },
                      {
                        value: "rejected",
                        label: "Rejected",
                        color: "hover:bg-red-50 text-red-700 border-red-200",
                      },
                    ].map((st) => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => handleUpdateStatus(st.value)}
                        disabled={loading || selectedReport.status === st.value}
                        className={`py-2 px-3 border text-xs font-bold rounded-xl transition ${st.color} ${
                          selectedReport.status === st.value
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Form Tambah Proof of Work */}
                <form onSubmit={handleAddLog} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Tambah Bukti Kerja (Proof of Work)
                  </h4>
                  <div>
                    <textarea
                      required
                      rows="3"
                      placeholder="Catatan pengerjaan lapangan (misal: Perbaikan pipa air selesai dilakukan...)"
                      value={logMessage}
                      onChange={(e) => setLogMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Foto Bukti Lapangan
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogFile(e.target.files[0])}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#0f2942] file:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#0f2942] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
                  >
                    {loading ? "Mengirim Log..." : "Kirim Log Progres"}
                  </button>
                </form>

                <hr className="border-slate-100" />

                {/* Riwayat Log Pekerjaan */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Riwayat Log Pekerjaan
                  </h4>
                  {logs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      Belum ada log pekerjaan yang dicatat.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-slate-500 text-[10px]">
                            <span className="font-bold text-slate-800">
                              {log.username}
                            </span>
                            <span>
                              {new Date(log.created_at).toLocaleString([], {
                                dateStyle: "short",
                                timeStyle: "short",
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
                              className="mt-2 rounded-lg border border-slate-200 w-full object-cover"
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
    </div>
  );
}
