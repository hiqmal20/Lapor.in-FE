"use client";

// Reuse admin laporan page logic with violet theme
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown, Clock, CheckCircle, XCircle, Eye, MapPin, Calendar } from "lucide-react";
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

export default function SuperAdminLaporanPage() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showPrioDropdown, setShowPrioDropdown] = useState(false);
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
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || l.status === activeTab;
    const matchCat = categoryFilter === "All Categories" || (l.category_name ?? "").trim().toLowerCase() === categoryFilter.trim().toLowerCase();
    const matchPrio = priorityFilter === "All Priority" || l.priority === priorityFilter;
    return matchSearch && matchTab && matchCat && matchPrio;
  });

  const countByStatus = (s: string) => laporan.filter((l) => l.status === s).length;
  const handleTabChange = (key: string) => { setFading(true); setTimeout(() => { setActiveTab(key); setFading(false); }, 150); };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={`space-y-4 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manage Reports</h1>
        <p className="text-xs text-gray-400 mt-0.5">Full oversight of all public complaints</p>
      </div>

      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-700">{filtered.length}</span> of <span className="font-semibold text-gray-700">{laporan.length}</span> reports
      </p>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm h-9 border-gray-200 focus:border-violet-400 transition-colors" />
        </div>
        {[{ state: showCatDropdown, setter: setShowCatDropdown, value: categoryFilter, options: categories, onChange: setCategoryFilter },
          { state: showPrioDropdown, setter: setShowPrioDropdown, value: priorityFilter, options: PRIORITIES, onChange: setPriorityFilter }
        ].map((dd, i) => (
          <div key={i} className="relative">
            <button onClick={() => { dd.setter((v: boolean) => !v); }}
              className="flex items-center gap-2 px-3 h-9 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors min-w-[130px]">
              <Filter size={13} className="text-gray-400" />{dd.value}
              <ChevronDown size={13} className={`ml-auto text-gray-400 transition-transform ${dd.state ? "rotate-180" : ""}`} />
            </button>
            {dd.state && (
              <div className="absolute right-0 top-10 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[170px]">
                {dd.options.map((opt) => (
                  <button key={opt} onClick={() => { dd.onChange(opt); dd.setter(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 capitalize ${dd.value === opt ? "bg-violet-600 text-white font-semibold" : "text-gray-600"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-gray-100">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === "all" ? laporan.length : countByStatus(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className={`relative px-3 py-2 text-xs font-medium rounded-t-lg transition-all duration-200 ${isActive ? "text-violet-600 bg-violet-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {tab.label}
              {count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${isActive ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className={`transition-opacity duration-150 ${fading ? "opacity-0" : "opacity-100"}`}>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Report", "Category", "Reporter", "Priority", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-gray-50 rounded animate-pulse" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-xs text-gray-400">No reports found</td></tr>
              ) : (
                filtered.map((l, idx) => {
                  const statusInfo = STATUS_STYLE[l.status] ?? STATUS_STYLE.pending;
                  return (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                      style={{ opacity: visible ? 1 : 0, transition: `opacity 0.3s ease ${idx * 30}ms` }}>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-violet-600 transition-colors">{l.title}</p>
                        {l.location && <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5"><MapPin size={10} />{l.location}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-violet-600 font-medium">{l.category_name || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {l.user_name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-[80px]">{l.user_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[l.priority] ?? PRIORITY_COLOR.low}`}>{l.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {l.status === "approved" ? <CheckCircle size={11} /> : l.status === "rejected" ? <XCircle size={11} /> : <Clock size={11} />}
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(l.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => router.push(`/superadmin/laporan/${l.id}`)}
                          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 hover:border-violet-400 px-2 py-1 rounded-lg transition-all hover:bg-violet-50">
                          <Eye size={12} /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
