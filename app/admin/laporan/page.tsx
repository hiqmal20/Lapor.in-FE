"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, Filter, ChevronDown, Clock, CheckCircle,
  XCircle, Eye, LayoutList, LayoutGrid, MapPin, Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  category_name: string;
  priority: "low" | "medium" | "high";
  user_name: string;
  location: string;
  created_at: string;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const PRIORITIES = ["All Priority", "high", "medium", "low"];

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

export default function AdminLaporanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("status") ?? "all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showPrioDropdown, setShowPrioDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/laporin/laporan"),
      apiFetch("/api/laporin/categories"),
    ]).then(([lRes, cRes]) => {
      if (lRes.ok) setLaporan(Array.isArray(lRes.data) ? lRes.data : lRes.data.data ?? []);
      if (cRes.ok) {
        const cats = Array.isArray(cRes.data) ? cRes.data : cRes.data.data ?? [];
        setCategories(["All Categories", ...cats.map((c: { name: string }) => c.name)]);
      }
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, []);

  const filtered = laporan.filter((l) => {
    const matchSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || l.status === activeTab;
    const matchCat =
      categoryFilter === "All Categories" ||
      (l.category_name ?? "").trim().toLowerCase() === categoryFilter.trim().toLowerCase();
    const matchPrio = priorityFilter === "All Priority" || l.priority === priorityFilter;
    return matchSearch && matchTab && matchCat && matchPrio;
  });

  const countByStatus = (s: string) => laporan.filter((l) => l.status === s).length;

  const handleTabChange = (key: string) => {
    setFading(true);
    setTimeout(() => { setActiveTab(key); setFading(false); }, 150);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={`space-y-4 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      {/* header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manage Reports</h1>
        <p className="text-xs text-gray-400 mt-0.5">Review and moderate all public complaints</p>
      </div>

      {/* count + view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{laporan.length}</span> reports
        </p>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md transition-all duration-150 ${viewMode === "table" ? "bg-white shadow-sm text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
          >
            <LayoutList size={14} />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`p-1.5 rounded-md transition-all duration-150 ${viewMode === "card" ? "bg-white shadow-sm text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* search + filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search reports, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm h-9 border-gray-200 focus:border-indigo-400 transition-colors"
          />
        </div>

        {/* category dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowCatDropdown((v) => !v); setShowPrioDropdown(false); }}
            className="flex items-center gap-2 px-3 h-9 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors min-w-[140px]"
          >
            <Filter size={13} className="text-gray-400" />
            {categoryFilter}
            <ChevronDown size={13} className={`text-gray-400 ml-auto transition-transform duration-200 ${showCatDropdown ? "rotate-180" : ""}`} />
          </button>
          {showCatDropdown && (
            <div className="absolute right-0 top-10 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[180px]">
              {categories.map((cat) => (
                <button key={cat} onClick={() => { setCategoryFilter(cat); setShowCatDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${categoryFilter === cat ? "bg-indigo-600 text-white font-semibold" : "text-gray-600"}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* priority dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowPrioDropdown((v) => !v); setShowCatDropdown(false); }}
            className="flex items-center gap-2 px-3 h-9 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors min-w-[120px]"
          >
            {priorityFilter}
            <ChevronDown size={13} className={`text-gray-400 ml-auto transition-transform duration-200 ${showPrioDropdown ? "rotate-180" : ""}`} />
          </button>
          {showPrioDropdown && (
            <div className="absolute right-0 top-10 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[130px]">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => { setPriorityFilter(p); setShowPrioDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors capitalize ${priorityFilter === p ? "bg-indigo-600 text-white font-semibold" : "text-gray-600"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === "all" ? laporan.length : countByStatus(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className={`relative px-3 py-2 text-xs font-medium rounded-t-lg transition-all duration-200 ${isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              )}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* content */}
      <div className={`transition-opacity duration-150 ${fading ? "opacity-0" : "opacity-100"}`}>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-white border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-xl text-gray-400">
            <Search size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No reports found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : viewMode === "table" ? (
          <TableView laporan={filtered} router={router} formatDate={formatDate} />
        ) : (
          <CardView laporan={filtered} router={router} formatDate={formatDate} />
        )}
      </div>
    </div>
  );
}

function TableView({ laporan, router, formatDate }: {
  laporan: Laporan[];
  router: ReturnType<typeof useRouter>;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {["Report", "Category", "Reporter", "Priority", "Status", "Date", "Action"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {laporan.map((l, idx) => {
            const statusInfo = STATUS_STYLE[l.status] ?? STATUS_STYLE.pending;
            return (
              <tr
                key={l.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                    {l.title}
                  </p>
                  {l.location && (
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />{l.location}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-indigo-600 font-medium">{l.category_name || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {l.user_name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[80px]">{l.user_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[l.priority] ?? PRIORITY_COLOR.low}`}>
                    {l.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {l.status === "approved" ? <CheckCircle size={11} /> : l.status === "rejected" ? <XCircle size={11} /> : <Clock size={11} />}
                    {statusInfo.label}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-400">{formatDate(l.created_at)}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => router.push(`/admin/laporan/${l.id}`)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 hover:border-indigo-400 px-2 py-1 rounded-lg transition-all duration-150 hover:bg-indigo-50"
                  >
                    <Eye size={12} />
                    Review
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CardView({ laporan, router, formatDate }: {
  laporan: Laporan[];
  router: ReturnType<typeof useRouter>;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {laporan.map((l, idx) => {
        const statusInfo = STATUS_STYLE[l.status] ?? STATUS_STYLE.pending;
        return (
          <div
            key={l.id}
            onClick={() => router.push(`/admin/laporan/${l.id}`)}
            className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all duration-200 hover:-translate-y-0.5 group"
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                  {l.category_name || "General"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[l.priority] ?? PRIORITY_COLOR.low}`}>
                  {l.priority}
                </span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusInfo.color}`}>
                {l.status === "approved" ? <CheckCircle size={11} /> : l.status === "rejected" ? <XCircle size={11} /> : <Clock size={11} />}
                {statusInfo.label}
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {l.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{l.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {l.user_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <span className="text-xs text-gray-500">{l.user_name}</span>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={10} />{formatDate(l.created_at)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}