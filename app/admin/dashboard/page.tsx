"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle, XCircle,
  AlertTriangle, ArrowRight, Activity,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  category_name: string;
  priority: "low" | "medium" | "high";
  user_name: string;
  created_at: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-gray-100 text-gray-600",
};

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-yellow-50 text-yellow-700 border border-yellow-200", label: "Pending" },
  under_review: { color: "bg-blue-50 text-blue-700 border border-blue-200", label: "Under Review" },
  approved: { color: "bg-green-50 text-green-700 border border-green-200", label: "Approved" },
  rejected: { color: "bg-red-50 text-red-700 border border-red-200", label: "Rejected" },
};

export default function AdminDashboardPage() {
  const user = getUser();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    apiFetch("/api/laporin/laporan").then(({ ok, data }) => {
      if (ok) setLaporan(Array.isArray(data) ? data : data.data ?? []);
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  const total = laporan.length;
  const pending = laporan.filter((l) => l.status === "pending").length;
  const under_review = laporan.filter((l) => l.status === "under_review").length;
  const approved = laporan.filter((l) => l.status === "approved").length;
  const rejected = laporan.filter((l) => l.status === "rejected").length;
  const highPriority = laporan.filter((l) => l.priority === "high" && l.status !== "approved" && l.status !== "rejected");
  const pendingList = laporan.filter((l) => l.status === "pending").slice(0, 4);
  const recentActivity = laporan.slice(0, 5);

  const stats = [
    { label: "Total Reports", value: total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", delay: 0 },
    { label: "Pending", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", delay: 50 },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", delay: 100 },
    { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50", delay: 150 },
  ];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={`space-y-5 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage and moderate public reports</p>
        </div>
      </div>

      {/* welcome banner */}
      <div className="bg-indigo-600 rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none">
          <div className="w-48 h-48 bg-white rounded-full absolute -right-12 -top-12" />
          <div className="w-32 h-32 bg-white rounded-full absolute -right-6 bottom-0" />
        </div>
        <h2 className="text-base font-bold mb-1">Welcome, {user?.name}!</h2>
        <p className="text-indigo-100 text-xs mb-4">
          You have <span className="font-bold text-white">{pending}</span> pending report{pending !== 1 ? "s" : ""} requiring your attention.
        </p>
        <Link
          href="/admin/laporan"
          className="inline-flex items-center gap-1.5 bg-white text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200 hover:scale-105"
        >
          <FileText size={13} />
          Manage Reports
        </Link>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            style={{ transitionDelay: `${s.delay}ms` }}
          >
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? <span className="inline-block w-6 h-6 bg-gray-100 rounded animate-pulse" /> : s.value}
              </p>
              {s.label === "Pending" && pending > 0 && (
                <p className="text-xs text-yellow-600 mt-0.5">Needs review</p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* high priority alert */}
      {highPriority.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-500" />
            <p className="text-sm font-semibold text-red-700">
              {highPriority.length} High Priority Report{highPriority.length > 1 ? "s" : ""} Need Immediate Attention
            </p>
          </div>
          <div className="space-y-2">
            {highPriority.slice(0, 3).map((l) => (
              <Link
                key={l.id}
                href={`/admin/laporan/${l.id}`}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 hover:bg-red-50 transition-colors group"
              >
                <p className="text-xs text-gray-700 group-hover:text-red-600 transition-colors">{l.title}</p>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[l.status]?.color}`}>
                  {l.status === "approved" ? <CheckCircle size={11} className="text-green-500" /> : l.status === "rejected" ? <XCircle size={11} className="text-red-500" /> : <Clock size={11} className="text-yellow-500" />}
                  {l.status.replace("_", " ")}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2-col: pending + recent activity */}
      <div className="grid grid-cols-2 gap-4">
        {/* pending reports */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={14} className="text-yellow-500" />
              Pending Reports ({pending})
            </h3>
            <Link href="/admin/laporan?status=pending" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
            </div>
          ) : pendingList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No pending reports</p>
          ) : (
            <div className="space-y-2">
              {pendingList.map((l) => (
                <Link
                  key={l.id}
                  href={`/admin/laporan/${l.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{l.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l.user_name} · {formatDate(l.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ml-2 shrink-0 ${PRIORITY_COLOR[l.priority] ?? PRIORITY_COLOR.low}`}>
                    {l.priority}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* recent activity */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              Recent Activity
            </h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((l) => {
                const statusInfo = STATUS_STYLE[l.status] ?? STATUS_STYLE.pending;
                return (
                  <Link
                    key={l.id}
                    href={`/admin/laporan/${l.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{l.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.category_name} · {formatDate(l.created_at)}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ml-2 shrink-0 ${STATUS_STYLE[l.status]?.color}`}>
                      {l.status === "approved" ? <CheckCircle size={11} className="text-green-500" /> : l.status === "rejected" ? <XCircle size={11} className="text-red-500" /> : <Clock size={11} className="text-yellow-500" />}
                      {l.status.replace("_", " ")}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* under review */}
      {under_review > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              Under Review ({under_review})
            </h3>
            <Link href="/admin/laporan?status=under_review" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {laporan.filter((l) => l.status === "under_review").slice(0, 4).map((l) => (
              <Link
                key={l.id}
                href={`/admin/laporan/${l.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-gray-50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{l.title}</p>
                  <p className="text-xs text-gray-400">{l.category_name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ml-2 shrink-0 ${PRIORITY_COLOR[l.priority] ?? PRIORITY_COLOR.low}`}>
                  {l.priority}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
