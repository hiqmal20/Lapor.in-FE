"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Users, Clock, CheckCircle, XCircle,
  ArrowRight, TrendingUp, Tag, ShieldCheck,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Laporan {
  id: number;
  title: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  category_name: string;
  priority: "low" | "medium" | "high";
  user_name: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  under_review: "bg-blue-50 text-blue-700 border border-blue-200",
  approved: "bg-green-50 text-green-700 border border-green-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

export default function SuperAdminDashboardPage() {
  const user = getUser();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/laporin/laporan"),
      apiFetch("/api/laporin/users"),
    ]).then(([lRes, uRes]) => {
      if (lRes.ok) setLaporan(Array.isArray(lRes.data) ? lRes.data : lRes.data.data ?? []);
      if (uRes.ok) setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data.data ?? []);
      setLoading(false);
      setTimeout(() => setVisible(true), 80);
    });
  }, []);

  const total = laporan.length;
  const pending = laporan.filter((l) => l.status === "pending").length;
  const under_review = laporan.filter((l) => l.status === "under_review").length;
  const approved = laporan.filter((l) => l.status === "approved").length;
  const rejected = laporan.filter((l) => l.status === "rejected").length;
  const citizens = users.filter((u) => u.role === "user").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const resolutionRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

  // category breakdown
  const catMap: Record<string, number> = {};
  laporan.forEach((l) => {
    const cat = l.category_name || "General";
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const categoryData = Object.entries(catMap)
    .map(([name, value]) => ({ name: name.split(" ")[0], value }))
    .sort((a, b) => b.value - a.value);

  // pie data
  const pieData = [
    { name: "Pending", value: pending },
    { name: "Under Review", value: under_review },
    { name: "Approved", value: approved },
    { name: "Rejected", value: rejected },
  ].filter((d) => d.value > 0);

  // monthly trend (group by month)
  const monthMap: Record<string, { submitted: number; resolved: number }> = {};
  laporan.forEach((l) => {
    const month = new Date(l.created_at).toLocaleDateString("en-US", { month: "short" });
    if (!monthMap[month]) monthMap[month] = { submitted: 0, resolved: 0 };
    monthMap[month].submitted++;
    if (l.status === "approved") monthMap[month].resolved++;
  });
  const trendData = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));

  const statCards = [
    { label: "Total Reports", value: total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", trend: "+12% vs last month" },
    { label: "Citizens", value: citizens, icon: Users, color: "text-violet-600", bg: "bg-violet-50", trend: "+24% vs last month" },
    { label: "Pending", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", note: "Needs attention" },
    { label: "Admins", value: admins, icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className={`space-y-5 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Complete system overview and analytics</p>
      </div>

      {/* welcome banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
          <div className="w-64 h-64 bg-white rounded-full absolute -right-16 -top-16 animate-pulse" />
          <div className="w-40 h-40 bg-white rounded-full absolute -right-8 bottom-0 animate-pulse" style={{ animationDelay: "400ms" }} />
        </div>
        <h2 className="text-base font-bold mb-1">Welcome back, {user?.name}!</h2>
        <p className="text-violet-100 text-xs">System health is good. Monitor all activity from this dashboard.</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={16} className={s.color} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? <span className="inline-block w-10 h-8 bg-gray-100 rounded animate-pulse" /> : s.value}
            </p>
            {s.trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={11} /> {s.trend}
              </p>
            )}
            {s.note && <p className="text-xs text-yellow-600 mt-1">{s.note}</p>}
          </div>
        ))}
      </div>

      {/* charts row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* area chart */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Report Volume Trend</h3>
              <p className="text-xs text-gray-400">Monthly submissions vs resolutions — 2025</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Submitted</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Resolved</span>
            </div>
          </div>
          <div className="h-48 mt-3">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="submitted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f0f0f0" }} />
                  <Area type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} fill="url(#submitted)" />
                  <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="url(#resolved)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-300">No data yet</div>
            )}
          </div>
        </div>

        {/* donut chart */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Status Distribution</h3>
          <p className="text-xs text-gray-400 mb-3">All time breakdown</p>
          <div className="h-36">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-300">No data</div>
            )}
          </div>
          <div className="space-y-1.5 mt-2">
            {[
              { label: "Pending", value: pending, color: "#f59e0b" },
              { label: "Under Review", value: under_review, color: "#3b82f6" },
              { label: "Approved", value: approved, color: "#22c55e" },
              { label: "Rejected", value: rejected, color: "#ef4444" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
                <span className="text-xs font-semibold text-gray-700">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* bar chart category */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Reports by Category</h3>
          <div className="h-48 mt-3">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#6d28d9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-300">No data</div>
            )}
          </div>
        </div>

        {/* latest reports */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Latest Reports</h3>
            <Link href="/superadmin/laporan" className="text-xs text-violet-600 hover:underline flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 bg-gray-50 rounded-lg animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))
            ) : (
              laporan.slice(0, 6).map((l, i) => (
                <Link
                  key={l.id}
                  href={`/superadmin/laporan/${l.id}`}
                  className="flex items-center justify-between py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate group-hover:text-violet-600 transition-colors">
                      {l.title}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(l.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ml-2 shrink-0 ${STATUS_BADGE[l.status]}`}>
                    {l.status.replace("_", " ")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* bottom stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Resolution Rate", value: `${resolutionRate}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending Rate", value: `${pendingRate}%`, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Categories", value: Object.keys(catMap).length, icon: Tag, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Total Users", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className={`p-2 rounded-lg ${s.bg} shrink-0`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{loading ? "—" : s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
