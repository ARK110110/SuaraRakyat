"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  // Data State
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Tab & UI State
  const [activeTab, setActiveTab] = useState("reports");
  const [toastMessage, setToastMessage] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);

  // Form Category State (CRUD)
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3200);
  };

  // 1. Proteksi Autentikasi & Verifikasi Role Admin
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      router.replace("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== "admin") {
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

  // 2. Fetch Seluruh Data Admin (Stats, Reports, Categories, Users)
  const fetchAdminData = async (currentToken) => {
    try {
      const headers = { Authorization: `Bearer ${currentToken}` };
      const [resStats, resReports, resCategories, resUsers] = await Promise.all(
        [
          fetch("/api/admin/dashboard/stats", { headers }),
          fetch("/api/reports", { headers }),
          fetch("/api/categories", { headers }),
          fetch("/api/users", { headers }),
        ],
      );

      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data.data || {});
      }
      if (resReports.ok) {
        const data = await resReports.json();
        setReports(data.data || []);
      }
      if (resCategories.ok) {
        const data = await resCategories.json();
        setCategories(data.data || []);
      }
      if (resUsers.ok) {
        const data = await resUsers.json();
        const allUsers = data.data || [];
        setUsers(allUsers);
        setStaffList(allUsers.filter((u) => u.role === "petugas"));
      }
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
      showToast("Gagal memuat data server");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData(token);
    }
  }, [token]);

  // 3. Update Status & Assignee Petugas untuk Laporan
  const handleUpdateReport = async (reportId, newStatus, assigneeId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          assignee_id: assigneeId !== "" ? assigneeId : null,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        showToast("Status & penugasan laporan berhasil diperbarui");
        fetchAdminData(token);
      } else {
        showToast(result.message || "Gagal memperbarui laporan");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi");
    }
  };

  // 4. CRUD Kategori (Tambah & Edit)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const url = editingCatId
      ? `/api/categories/${editingCatId}`
      : "/api/categories";
    const method = editingCatId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_name: catName, description: catDesc }),
      });

      const result = await res.json();
      if (res.ok) {
        showToast(
          editingCatId
            ? "Kategori berhasil diperbarui"
            : "Kategori baru berhasil ditambahkan",
        );
        setCatName("");
        setCatDesc("");
        setEditingCatId(null);
        fetchAdminData(token);
      } else {
        showToast(result.message || "Gagal menyimpan kategori");
      }
    } catch (err) {
      showToast("Kesalahan koneksi server");
    }
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.category_name);
    setCatDesc(cat.description || "");
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        showToast("Kategori berhasil dihapus");
        fetchAdminData(token);
      } else {
        showToast(result.message || "Gagal menghapus kategori");
      }
    } catch (err) {
      showToast("Kesalahan koneksi");
    }
  };

  // 5. Manajemen Pengguna (Ubah Role & Hapus User)
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const result = await res.json();
      if (res.ok) {
        showToast("Role pengguna berhasil diperbarui");
        fetchAdminData(token);
      } else {
        showToast(result.message || "Gagal mengubah role");
      }
    } catch (err) {
      showToast("Kesalahan koneksi");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus akun pengguna ini?"))
      return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        showToast("Pengguna berhasil dihapus");
        fetchAdminData(token);
      } else {
        showToast(result.message || "Gagal menghapus pengguna");
      }
    } catch (err) {
      showToast("Kesalahan koneksi");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/");
  };

  if (isRestricted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <h2 className="text-xl font-bold tracking-tight">
            Restricted Page (Akses Ditolak)
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Halaman ini khusus untuk Administrator sistem.
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium transition-all">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm">
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
              Dashboard Administrator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user.username}</p>
            <p className="text-[11px] font-semibold text-red-600 capitalize">
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

      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">
              Total Laporan
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.total_reports || 0}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-amber-600 uppercase">
              Pending
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats.pending_reports || 0}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-blue-600 uppercase">
              In Progress
            </p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {stats.in_progress_reports || 0}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase">
              Resolved
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.resolved_reports || 0}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
            <p className="text-xs font-bold text-indigo-600 uppercase">
              Total Users
            </p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              {stats.total_users || 0}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
          {[
            { id: "reports", label: "Kelola Laporan" },
            { id: "categories", label: "Kelola Kategori" },
            { id: "users", label: "Kelola Pengguna" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition ${
                activeTab === tab.id
                  ? "border-[#0f2942] text-[#0f2942]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Kelola Laporan */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 font-extrabold text-slate-900 text-sm">
              Semua Laporan Warga &amp; Penugasan Petugas
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-5">Pelapor &amp; Judul</th>
                    <th className="py-3.5 px-5">Kategori</th>
                    <th className="py-3.5 px-5">Status Laporan</th>
                    <th className="py-3.5 px-5">Petugas Penanggung Jawab</th>
                    <th className="py-3.5 px-5 text-right">Lampiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-12 text-center text-slate-400 text-sm"
                      >
                        Belum ada laporan.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900">
                            {r.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Oleh: {r.reporter_name}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-xs font-semibold text-slate-700">
                          {r.category_name}
                        </td>
                        <td className="py-4 px-5">
                          <select
                            value={r.status}
                            onChange={(e) =>
                              handleUpdateReport(
                                r.id,
                                e.target.value,
                                r.assignee_id,
                              )
                            }
                            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-4 px-5">
                          <select
                            value={r.assignee_id || ""}
                            onChange={(e) =>
                              handleUpdateReport(r.id, r.status, e.target.value)
                            }
                            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none"
                          >
                            <option value="">-- Pilih Petugas --</option>
                            {staffList.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.username}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-5 text-right">
                          {r.attachment_url ? (
                            <a
                              href={r.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 font-bold hover:underline"
                            >
                              Lihat Foto ↗
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Tidak ada
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Kelola Kategori */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingCatId ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <form onSubmit={handleSaveCategory} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Infrastruktur"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Deskripsi kategori aduan..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f2942]"
                  ></textarea>
                </div>
                <div className="flex gap-2 pt-2">
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null);
                        setCatName("");
                        setCatDesc("");
                      }}
                      className="w-1/2 py-2.5 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0f2942] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    {editingCatId ? "Simpan Perubahan" : "Tambah Kategori"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Daftar Kategori Sistem
              </h3>
              <div className="space-y-2.5">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {c.category_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditCategoryClick(c)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Kelola Pengguna */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 font-extrabold text-slate-900 text-sm">
              Manajemen Pengguna &amp; Hak Akses Role
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-5">Username</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Role Akun</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {u.username}
                      </td>
                      <td className="py-4 px-5 text-slate-600 text-xs">
                        {u.email}
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={u.role}
                          disabled={u.id === user.id}
                          onChange={(e) =>
                            handleChangeUserRole(u.id, e.target.value)
                          }
                          className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 disabled:opacity-50 focus:outline-none"
                        >
                          <option value="pelapor">pelapor</option>
                          <option value="petugas">petugas</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-4 px-5 text-right">
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            Hapus User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
