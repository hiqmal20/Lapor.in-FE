"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  category_name: string;
  priority: "low" | "medium" | "high";
  location: string;
  created_at: string;
  admin_note?: string;
  image?: string;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-gray-100 text-gray-600",
};

const STATUS_STYLE: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: {
    color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: <Clock size={12} className="text-yellow-500" />,
  },
  under_review: {
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <Clock size={12} className="text-blue-500" />,
  },
  approved: {
    color: "bg-green-50 text-green-700 border border-green-200",
    icon: <CheckCircle size={12} className="text-green-500" />,
  },
  rejected: {
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: <XCircle size={12} className="text-red-500" />,
  },
};

const CATEGORY_COLOR: Record<string, string> = {
  "Road & Infrastructure": "bg-blue-50 text-blue-700",
  "Water & Sanitation": "bg-cyan-50 text-cyan-700",
  "Public Safety": "bg-purple-50 text-purple-700",
  Environment: "bg-green-50 text-green-700",
  "Public Services": "bg-orange-50 text-orange-700",
  Transportation: "bg-indigo-50 text-indigo-700",
};

export default function MyLaporanPage() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/laporin/laporan/my/laporan"),
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
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || l.status === activeTab;
    const matchCat =
      categoryFilter === "All Categories" ||
      (l.category_name ?? "").trim().toLowerCase() === categoryFilter.trim().toLowerCase();
    return matchSearch && matchTab && matchCat;
  });

  const countByStatus = (s: string) => laporan.filter((l) => l.status === s).length;

  const handleTabChange = (key: string) => {
    setFading(true);
    setTimeout(() => {
      setActiveTab(key);
      setFading(false);
    }, 150);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getCatColor = (cat: string) =>
    CATEGORY_COLOR[cat] ?? "bg-gray-100 text-gray-600";

  const total = laporan.length;
  const pending = countByStatus("pending");
  const under_review = countByStatus("under_review");
  const approved = countByStatus("approved");
  const rejected = countByStatus("rejected");

  const statCards = [
    { label: "Total", value: total, color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    { label: "Pending", value: pending, color: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-400" },
    { label: "Under Review", value: under_review, color: "bg-blue-50 text-blue-600", dot: "bg-blue-400" },
    { label: "Approved", value: approved, color: "bg-green-50 text-green-700", dot: "bg-green-500" },
    { label: "Rejected", value: rejected, color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  ];

  return (
    <div className={`flex flex-col h-full min-h-[calc(100vh-3rem)] space-y-4 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Reports</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track and manage your submitted reports</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/laporan/buat")}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 transition-all duration-200 hover:scale-105"
        >
          <Plus size={14} />
          New Report
        </Button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-5 gap-3">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className={`rounded-xl px-4 py-3 flex flex-col gap-1 ${s.color} transition-all duration-300 hover:scale-[1.03] hover:shadow-sm`}
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-xs font-medium opacity-80">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm h-9 border-gray-200 focus:border-blue-400 transition-colors"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-2 px-3 h-9 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter size={13} className="text-gray-400" />
            {categoryFilter}
            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-10 z-10 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[180px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategoryFilter(cat); setShowDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                    categoryFilter === cat ? "bg-blue-600 text-white font-semibold" : "text-gray-600"
                  }`}
                >
                  {cat}
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
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`relative px-3 py-2 text-xs font-medium rounded-t-lg transition-all duration-200 ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-gray-400 self-center pr-1">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* cards — flex-1 so it fills remaining height */}
      <div className={`flex-1 transition-opacity duration-150 ${fading ? "opacity-0" : "opacity-100"}`}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-64 text-gray-400 bg-white border border-gray-100 rounded-xl">
            <FileText size={48} className="text-gray-200 mb-4" />
            <p className="text-sm font-medium text-gray-500">No reports found</p>
            <p className="text-xs mt-1 mb-5">
              {search || categoryFilter !== "All Categories" || activeTab !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't submitted any reports yet"}
            </p>
            {activeTab === "all" && !search && categoryFilter === "All Categories" && (
              <Button
                size="sm"
                onClick={() => router.push("/dashboard/laporan/buat")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              >
                <Plus size={13} />
                Submit your first report
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const statusInfo = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending;
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/dashboard/laporan/${item.id}`)}
                  className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-100 transition-all duration-200 hover:-translate-y-0.5 group"
                  style={{ animationDelay: `${idx * 40}ms`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: `opacity 0.3s ease ${idx * 50}ms, transform 0.3s ease ${idx * 50}ms, box-shadow 0.2s, border-color 0.2s` }}
                >
                  <div className="flex gap-3">
                    {/* thumbnail */}
                    {item.image && (
                      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.image}`}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).parentElement!.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCatColor(item.category_name)}`}>
                            {item.category_name || "General"}
                          </span>
                          {item.priority && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[item.priority] ?? PRIORITY_COLOR.low}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {item.status.replace("_", " ")}
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors truncate">
                        {item.title}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        {item.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                            <MapPin size={11} />
                            {item.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                          <Calendar size={11} />
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      {item.admin_note && (
                        <div className="mt-2 pt-2 border-t border-gray-50">
                          <p className="text-xs text-gray-500 line-clamp-1">
                            <span className="font-semibold text-gray-700">Admin Note:</span>{" "}
                            {item.admin_note}
                          </p>
                        </div>
                      )}
                    </div>
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
