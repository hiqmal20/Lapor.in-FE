"use client";

import { useEffect, useState } from "react";
import { Search, Users, Shield, User, Trash2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { getUser, setAuth } from "@/lib/auth"; // Diimpor untuk sinkronisasi internal

interface UserData {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  created_at: string;
  phone?: string;
}

const ROLE_STYLE: Record<string, string> = {
  user: "bg-blue-50 text-blue-700",
  admin: "bg-indigo-50 text-indigo-700",
  super_admin: "bg-violet-50 text-violet-700",
};

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<UserData["role"]>("admin");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/laporin/users").then(({ ok, data }) => {
      if (ok) setUsers(Array.isArray(data) ? data : (data.data ?? []));
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ====================================================================
  // PERBAIKAN LOGIK 1: Amankan role change & sinkronisasi jika mengubah diri sendiri
  // ====================================================================
  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);

    const payload = { 
      role: newRole,
      is_on_duty: 0 // Langsung set flat 0 untuk standarisasi backend
    };

    let result = await apiFetch(`/api/laporin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!result.ok && result.status === 404) {
      result = await apiFetch(`/api/laporin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    if (result.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as UserData["role"] } : u,
        ),
      );

      // FAIL-SAFE: Jika Super Admin mengubah role akunnya sendiri, update localStorage-nya juga
      const currentUser = getUser() as UserData | null;
      if (currentUser && currentUser.id === userId) {
        const updatedSelf = { ...currentUser, role: newRole as UserData["role"] };
        const token = localStorage.getItem("token") ?? "";
        setAuth(updatedSelf, token);
        localStorage.setItem("user", JSON.stringify(updatedSelf));
      }
    } else {
      alert(result.data?.message || "Gagal mengubah role pengguna.");
    }

    setUpdatingId(null);
  };

  // ====================================================================
  // PERBAIKAN LOGIK 2: Standarisasi penangkapan objek user baru agar tidak kosong di tabel
  // ====================================================================
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess(false);
    setCreateLoading(true);

    if (!createName || !createEmail || !createPassword) {
      setCreateError("Semua field harus diisi.");
      setCreateLoading(false);
      return;
    }

    const payload = {
      name: createName,
      email: createEmail,
      password: createPassword,
      role: createRole,
      is_on_duty: 0
    };

    let response = await apiFetch("/api/laporin/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status === 404) {
      response = await apiFetch("/api/laporin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      setCreateError(response.data?.message || "Gagal membuat akun baru.");
      setCreateLoading(false);
      return;
    }

    // Ekstraksi berlapis untuk mengantisipasi perbedaan format bungkus data backend
    const serverData = response.data?.data ?? response.data?.user ?? response.data;
    
    if (serverData) {
      const newUser: UserData = {
        id: serverData.id || Date.now(), // Fallback ID sementara jika backend tidak return ID
        name: serverData.name || createName,
        email: serverData.email || createEmail,
        role: serverData.role || createRole,
        created_at: serverData.created_at || new Date().toISOString(), // Hindari tulisan Invalid Date
        phone: serverData.phone || "",
      };
      
      setUsers((prev) => [newUser, ...prev]);
    }

    setCreateSuccess(true);
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateRole("admin");
    setCreateLoading(false);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Delete this user?")) return;
    const { ok } = await apiFetch(`/api/laporin/users/${userId}`, {
      method: "DELETE",
    });
    if (ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // ====================================================================
  // PERBAIKAN LOGIK 3: Proteksi parser tanggal dari crash / teks 'Invalid Date'
  // ====================================================================
  const formatDate = (d?: string) => {
    if (!d) return "—";
    const date = new Date(d);
    return isNaN(date.getTime()) 
      ? "—" 
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const counts = {
    all: users.length,
    user: users.filter((u) => u.role === "user").length,
    admin: users.filter((u) => u.role === "admin").length,
    super_admin: users.filter((u) => u.role === "super_admin").length,
  };

  return (
    <div
      className={`space-y-5 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          View and manage all registered users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: counts.all, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Citizens", value: counts.user, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Admins", value: counts.admin, icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Super Admins", value: counts.super_admin, icon: Shield, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : s.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <s.icon size={18} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm h-9 border-gray-200 focus:border-violet-400 transition-colors"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-2 px-3 h-9 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors min-w-[130px]"
          >
            {roleFilter === "all"
              ? "All Roles"
              : roleFilter === "super_admin"
                ? "Super Admin"
                : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
            <ChevronDown size={13} className={`ml-auto text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-10 z-10 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[140px]">
              {[
                ["all", "All Roles"],
                ["user", "Citizens"],
                ["admin", "Admins"],
                ["super_admin", "Super Admins"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => {
                    setRoleFilter(val);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${roleFilter === val ? "bg-violet-600 text-white font-semibold" : "text-gray-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create User Form */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Create new account</p>
            <p className="text-xs text-gray-500">Add a new user account and assign role immediately</p>
          </div>
          {createSuccess && (
            <div className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium">
              Akun berhasil dibuat.
            </div>
          )}
        </div>

        <form onSubmit={handleCreateUser} className="grid gap-3 mt-4 sm:grid-cols-4">
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Nama lengkap"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white text-gray-800"
          />
          <input
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white text-gray-800"
          />
          <input
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white text-gray-800"
          />
          <div className="flex gap-2 sm:gap-3">
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as UserData["role"])}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white text-gray-800"
            >
              <option value="user">Citizen</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <button
              type="submit"
              disabled={createLoading}
              className="bg-violet-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 shrink-0"
            >
              {createLoading ? "Membuat..." : "Buat akun"}
            </button>
          </div>
        </form>

        {createError && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {createError}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-8 bg-gray-50 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-xs text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u, idx) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                  style={{
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.3s ease ${idx * 40}ms`,
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingId === u.id}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-400 ${ROLE_STYLE[u.role]}`}
                    >
                      <option value="user">Citizen</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 p-1 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}