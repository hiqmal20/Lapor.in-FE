"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Radio, Power, Mail, Phone, Clock, UserCheck, UserX } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface AdminStaff {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_on_duty: number | boolean;
  updated_at: string;
}

export default function SuperAdminDutyMonitorPage() {
  const [admins, setAdmins] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);

 const fetchAdminDuty = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await apiFetch("/api/laporin/users/admin-duty");
    
    if (ok) {
      // PERBAIKAN: Logika pengecekan yang jauh lebih kuat untuk membaca array
      if (data && Array.isArray(data)) {
        setAdmins(data);
      } else if (data && Array.isArray(data.data)) {
        setAdmins(data.data);
      } else if (data && typeof data === 'object') {
        // Jika backend mengirimkan objek yang langsung berisi list admin di dalamnya
        const potentialArray = Object.values(data).find(val => Array.isArray(val));
        if (potentialArray) {
          setAdmins(potentialArray as AdminStaff[]);
        } else {
          setAdmins([]);
        }
      } else {
        setAdmins([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdminDuty();
    const interval = setInterval(fetchAdminDuty, 10000); // Auto-refresh tiap 10 detik
    return () => clearInterval(interval);
  }, [fetchAdminDuty]);

  const totalAdmin = admins.length;
  const onlineAdmin = admins.filter(a => Number(a.is_on_duty) === 1 || a.is_on_duty === true).length;
  const offlineAdmin = totalAdmin - onlineAdmin;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-indigo-600" size={24} />
            Admin Duty Monitor
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Pantau status aktif (On/Off Duty) seluruh akun Admin secara real-time</p>
        </div>
        <button 
          onClick={fetchAdminDuty}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 text-gray-700 shadow-sm transition-all"
        >
          Refresh Data
        </button>
      </div>

      {/* Ringkasan Status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase">Total Admin Staff</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalAdmin}</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Radio size={20} /></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase">On Duty (Aktif)</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{onlineAdmin}</p>
          </div>
          <div className="p-2.5 bg-green-50 text-green-600 rounded-lg"><UserCheck size={20} /></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase">Off Duty (Istirahat)</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">{offlineAdmin}</p>
          </div>
          <div className="p-2.5 bg-gray-50 text-gray-400 rounded-lg"><UserX size={20} /></div>
        </div>
      </div>

      {/* Daftar Admin Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Direktori Aktivitas Admin</h2>
        
        {loading && admins.length === 0 ? (
          <p className="text-xs text-gray-400">Memuat data direktori admin...</p>
        ) : admins.length === 0 ? (
          <p className="text-xs text-gray-400">Tidak ada user dengan role 'admin' di database.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((admin) => {
              const isActive = Number(admin.is_on_duty) === 1 || admin.is_on_duty === true;
              
              return (
                <div 
                  key={admin.id} 
                  className={`border rounded-xl p-4 relative transition-all duration-200 ${
                    isActive 
                      ? "border-green-200 bg-gradient-to-br from-white to-green-50/20 shadow-sm" 
                      : "border-gray-100 bg-white shadow-none"
                  }`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}></span>
                    <span className={`text-[10px] font-bold uppercase ${isActive ? "text-green-700" : "text-gray-400"}`}>
                      {isActive ? "ON DUTY" : "OFF DUTY"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 pr-16 truncate">{admin.name}</h3>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-2">
                      <Mail size={12} /> {admin.email}
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <Phone size={12} /> {admin.phone || "No phone registered"}
                    </p>
                  </div>

                  <div className="border-t border-gray-50 mt-4 pt-3 flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Sinkronisasi Terakhir:
                    </span>
                    <span className="font-medium text-gray-600">
                      {admin.updated_at ? new Date(admin.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}