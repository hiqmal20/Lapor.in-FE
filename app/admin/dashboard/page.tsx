"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle, XCircle,
  Power, User, Info
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  category_name: string;
  admin_id: number | null;
  admin_name: string | null; // Tambahkan ini agar nama admin terbaca dari backend
  created_at: string;
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const user = getUser(); // Mengambil data admin yang sedang login

  const fetchLaporan = useCallback(async () => {
  setLoading(true);
  try {
    // 💡 SOLUSI: Tambahkan ?t=${Date.now()} sebagai cache-buster 
    // Supaya Next.js & Browser dipaksa mengambil data paling fresh dari DB, bukan dari cache.
    const { ok, data } = await apiFetch(`/api/laporin/laporan?t=${Date.now()}`); 
    
    if (ok) {
      setLaporan(Array.isArray(data) ? data : (data?.data || []));
    } else {
      console.error("Dashboard API returned ok: false");
      // Kamu bisa memunculkan pesan error/toast di sini jika diperlukan
    }
  } catch (error) {
    console.error("Gagal mengambil data laporan:", error);
  } finally {
    setLoading(false);
    setVisible(true);
  }
}, []);

  useEffect(() => {
    setMounted(true);
    fetchLaporan();
    apiFetch(`/api/laporin/users/me`).then(({ ok, data }) => {
      if (ok) {
        const currentDuty = data.is_on_duty === 1;
        setIsOnDuty(currentDuty);
        
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        localUser.is_on_duty = data.is_on_duty;
        localStorage.setItem("user", JSON.stringify(localUser));
      }
    });
  }, [fetchLaporan]);

  const handleToggleDuty = async () => {
    if (!user) return;
    const res = await apiFetch(`/api/laporin/users/toggle-duty/${user.id}`, { method: 'PUT' });
    if (res.ok) {
      const newDutyStatus = res.data.is_on_duty === 1;
      setIsOnDuty(newDutyStatus);
      
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localUser.is_on_duty = res.data.is_on_duty;
      localStorage.setItem("user", JSON.stringify(localUser));

      fetchLaporan();
    }
  };

  if (!mounted) return null;

  // ====================================================================
  // PERBAIKAN LOGIKA STATISTIK: Filter khusus untuk tugas Admin ini saja
  // ====================================================================
const myTasks = laporan.filter((l) => {
  // Jika laporan tidak ada adminnya, jelas bukan tugas kita
  if (!l.admin_id || !user?.id) return false; 
  
  // Samakan dua-duanya menjadi tipe Number agar perbandingannya akurat
  return Number(l.admin_id) === Number(user?.id);
});

  

  const totalMyTasks = myTasks.length;

  const pending = myTasks.filter((l) => {
    const s = l.status?.toLowerCase().trim();
    return s === "pending" || s === "under_review";
  }).length;

  const approved = myTasks.filter((l) => {
    return l.status?.toLowerCase().trim() === "approved";
  }).length;

  const rejected = myTasks.filter((l) => {
    return l.status?.toLowerCase().trim() === "rejected";
  }).length;

  const stats = [
    { label: "My Tasks", value: totalMyTasks, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className={`space-y-5 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your assigned reports</p>
        </div>
        <button
          onClick={handleToggleDuty}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
            isOnDuty ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          <Power size={14} />
          {isOnDuty ? "ON DUTY" : "OFF DUTY"}
        </button>
      </div>

      {/* Banner */}
      <div className="bg-indigo-600 rounded-xl p-5 text-white">
        <h2 className="text-base font-bold mb-1">Welcome back, {user?.name}!</h2>
        <p className="text-indigo-100 text-xs mb-4">
          Status: <span className="font-bold">{isOnDuty ? "Active" : "Away"}</span> | 
          You have <span className="font-bold text-white">{pending}</span> active reports to handle.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "..." : s.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={20} className={s.color} /></div>
          </div>
        ))}
      </div>

      {/* Recent Assigned Reports */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Reports Feed</h3>
        {loading ? <p className="text-xs text-gray-400">Loading...</p> : laporan.length === 0 ? (
          <p className="text-xs text-gray-400">No reports found.</p>
        ) : (
          <div className="space-y-3">
            {laporan.slice(0, 5).map((l) => (
              <Link 
                href={`/admin/laporan/${l.id}`} 
                key={l.id} 
                className="flex items-center justify-between p-3 border border-gray-50 rounded-lg hover:bg-indigo-50 transition-all group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{l.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    
                    {/* ====================================================================
                        FIX KONDISI BADGE LABEL TUGAS ADMIN (3 KONDISI SECARA ADIL)
                       ==================================================================== */}
                    {l.admin_id === null ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-amber-50 text-amber-600 border-amber-200">
                        AVAILABLE
                      </span>
                    ) : l.admin_id === user?.id ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-blue-50 text-blue-600 border-blue-200">
                        ASSIGNED TO ME
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-gray-100 text-gray-600 border-gray-200">
                        WORK ON BY {l.admin_name?.toUpperCase() || "ADMIN LAIN"}
                      </span>
                    )}

                    <p className="text-[10px] text-gray-400">{l.category_name} • {new Date(l.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${
                  l.status === 'pending' || l.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' : 
                  l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {l.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}