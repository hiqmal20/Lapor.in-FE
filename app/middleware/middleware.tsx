"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, XCircle, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Laporan {
  id: number;
  title: string;
  status: "pending" | "approved" | "rejected";
  category_name: string;
  created_at: string;
}

export default function DashboardPage() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const fetchLaporan = async () => {
      const { ok, data } = await apiFetch("/laporan/my/laporan");
      if (ok) setLaporan(data);
      setLoading(false);
    };
    fetchLaporan();
  }, []);

  const total = laporan.length;
  const pending = laporan.filter((l) => l.status === "pending").length;
  const approved = laporan.filter((l) => l.status === "approved").length;
  const rejected = laporan.filter((l) => l.status === "rejected").length;

  const stats = [
    { label: "Total Reports", value: total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const recentLaporan = laporan.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* welcome banner */}
      <div className="bg-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-full opacity-20">
          <div className="w-40 h-40 bg-white rounded-full absolute -right-10 -top-10"></div>
          <div className="w-24 h-24 bg-white rounded-full absolute -right-5 bottom-0"></div>
        </div>
        <h2 className="text-xl font-bold mb-1">Welcome back, {user?.name}!</h2>
        <p className="text-blue-100 text-sm mb-4">Track your reports and stay updated on their status.</p>
        <Button asChild size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
          <Link href="/dashboard/laporan/buat" className="flex items-center gap-2">
            <Plus size={14} />
            Submit New Report
          </Link>
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-gray-100 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* progress bar status */}
      <Card className="border border-gray-100 shadow-none">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Report Status Overview</h3>
          <div className="flex w-full h-2 rounded-full overflow-hidden gap-0.5">
            {total > 0 ? (
              <>
                {pending > 0 && (
                  <div className="bg-yellow-400 h-full" style={{ width: `${(pending / total) * 100}%` }} />
                )}
                {approved > 0 && (
                  <div className="bg-green-500 h-full" style={{ width: `${(approved / total) * 100}%` }} />
                )}
                {rejected > 0 && (
                  <div className="bg-red-500 h-full" style={{ width: `${(rejected / total) * 100}%` }} />
                )}
              </>
            ) : (
              <div className="bg-gray-200 h-full w-full" />
            )}
          </div>
          <div className="flex gap-4 mt-3">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>
              Pending ({pending})
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Approved ({approved})
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
              Rejected ({rejected})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* recent laporan */}
      <Card className="border border-gray-100 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Reports</h3>
            <Link href="/dashboard/laporan" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Memuat...</p>
          ) : recentLaporan.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada laporan</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentLaporan.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex gap-2 mb-1">
                      <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                        {item.category_name || "Umum"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                  <Badge className={`${statusStyle[item.status]} text-xs capitalize`} variant="secondary">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/laporan/buat">
          <Card className="border border-gray-100 shadow-none hover:shadow-sm transition cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Plus size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Submit New Report</p>
                  <p className="text-xs text-gray-400">File a public complaint or issue</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/laporan">
          <Card className="border border-gray-100 shadow-none hover:shadow-sm transition cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">View My Reports</p>
                  <p className="text-xs text-gray-400">Track all your submitted reports</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}