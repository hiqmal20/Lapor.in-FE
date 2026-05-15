"use client";

import { useEffect, useState } from "react";
import { Search, Users, Shield, User, Trash2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

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

  useEffect(() => {
    apiFetch("/api/laporin/users").then(({ ok, data }) => {
      if (ok) setUsers(Array.isArray(data) ? data : data.data ?? []);
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

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    const { ok } = await apiFetch(`/api/laporin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role: newRole }),
    });
    if (ok) setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as UserData["role"] } : u));
    setUpdatingId(null);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Delete this user?")) return;
    const { ok } = await apiFetch(`/api/laporin/users/${userId}`, { method: "DELETE" });
    if (ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const counts = {
    all: users.length,
    user: users.filter((u) => u.role === "user").length,
    admin: users.filter((u) => u.role === "admin").length,
    super_admin: users.filter((u) => u.role === "super_admin").length,
  };

  return (
    <div className={`space-y-5 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-xs text-gray-400 mt-0.5">View and manage all registered users</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: counts.all, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Citizens", value: counts.user, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Admins", value: counts.admin, icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Super Admins", value: counts.super_admin, icon: Shield, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s, i) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ transitionDelay: `${i * 50}ms` }}>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : s.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={18} className={s.color} /></div>
          </div>
        ))}
      </div>

      {/* search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm h-9 border-gray-200 focus:border-violet-400 transition-colors" />
        </div>
        <div className="relative">
          <button onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-2 px-3 h-9 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors min-w-[130px]">
            {roleFilter === "all" ? "All Roles" : roleFilter === "super_admin" ? "Super Admin" : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
            <ChevronDown size={13} className={`ml-auto text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-10 z-10 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[140px]">
              {[["all", "All Roles"], ["user", "Citizens"], ["admin", "Admins"], ["super_admin", "Super Admins"]].map(([val, label]) => (
                <button key={val} onClick={() => { setRoleFilter(val); setShowDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${roleFilter === val ? "bg-violet-600 text-white font-semibold" : "text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-8 bg-gray-50 rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-xs text-gray-400">No users found</td></tr>
            ) : (
              filtered.map((u, idx) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                  style={{ opacity: visible ? 1 : 0, transition: `opacity 0.3s ease ${idx * 40}ms` }}>
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
                    <button onClick={() => handleDelete(u.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 p-1 rounded">
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
