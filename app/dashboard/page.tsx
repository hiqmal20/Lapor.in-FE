"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
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
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    setUser(getUser());
    apiFetch("/api/laporin/laporan/my/laporan").then(({ ok, data }) => {
      if (ok) setLaporan(Array.isArray(data) ? data : (data.data ?? []));
      setLoading(false);
    });
    setTimeout(() => setVisible(true), 50);
  }, []);

  const total = laporan.length;
  const pending = laporan.filter((l) => l.status === "pending").length;
  const approved = laporan.filter((l) => l.status === "approved").length;
  const rejected = laporan.filter((l) => l.status === "rejected").length;

  const stats = [
    {
      label: "Total Reports",
      value: total,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const recentLaporan = laporan.slice(0, 3);

  return (
    <div
      className={`space-y-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-sm text-gray-500">
              Kelola laporanmu dan lihat perkembangan terbaru
            </p>
          </div>
        </div>
      </div>

      {/* welcome banner */}
      <div
        className="bg-blue-600 rounded-xl p-6 text-white relative overflow-hidden transition-all duration-500"
        style={{ transitionDelay: "0ms" }}
      >
        <div className="absolute right-0 top-0 w-40 h-full opacity-20 pointer-events-none">
          <div className="w-40 h-40 bg-white rounded-full absolute -right-10 -top-10 animate-pulse" />
          <div
            className="w-24 h-24 bg-white rounded-full absolute -right-5 bottom-0 animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <h2 className="text-xl font-bold mb-1">Welcome back, {user?.name}!</h2>
        <p className="text-blue-100 text-sm mb-4">
          Track your reports and stay updated on their status.
        </p>
        <Button
          asChild
          size="sm"
          className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-200"
        >
          <Link
            href="/dashboard/laporan/buat"
            className="flex items-center gap-2"
          >
            <Plus size={14} />
            Submit New Report
          </Link>
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border border-gray-100 shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? (
                    <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg ${stat.bg} transition-transform duration-200 hover:scale-110`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* progress bar */}
      <Card className="border border-gray-100 shadow-none">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Report Status Overview
          </h3>
          <div className="flex w-full h-2 rounded-full overflow-hidden gap-0.5">
            {total > 0 ? (
              <>
                {pending > 0 && (
                  <div
                    className="bg-yellow-400 h-full transition-all duration-700 ease-out"
                    style={{ width: `${(pending / total) * 100}%` }}
                  />
                )}
                {approved > 0 && (
                  <div
                    className="bg-green-500 h-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(approved / total) * 100}%`,
                      transitionDelay: "100ms",
                    }}
                  />
                )}
                {rejected > 0 && (
                  <div
                    className="bg-red-500 h-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(rejected / total) * 100}%`,
                      transitionDelay: "200ms",
                    }}
                  />
                )}
              </>
            ) : (
              <div className="bg-gray-200 h-full w-full" />
            )}
          </div>
          <div className="flex gap-4 mt-3">
            {[
              { label: "Pending", count: pending, color: "bg-yellow-400" },
              { label: "Approved", count: approved, color: "bg-green-500" },
              { label: "Rejected", count: rejected, color: "bg-red-500" },
            ].map((s) => (
              <span
                key={s.label}
                className="text-xs text-gray-500 flex items-center gap-1"
              >
                <span
                  className={`w-2 h-2 ${s.color} rounded-full inline-block`}
                />
                {s.label} ({s.count})
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* recent laporan */}
      <Card className="border border-gray-100 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Recent Reports
            </h3>
            <Link
              href="/dashboard/laporan"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 hover:gap-2 transition-all duration-150"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-50 rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : recentLaporan.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Belum ada laporan
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentLaporan.map((item, i) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div>
                    <div className="flex gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-200 text-xs"
                      >
                        {item.category_name || "Umum"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    className={`${statusStyle[item.status]} text-xs capitalize`}
                    variant="secondary"
                  >
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
        {[
          {
            href: "/dashboard/laporan/buat",
            icon: Plus,
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            title: "Submit New Report",
            desc: "File a public complaint or issue",
          },
          {
            href: "/dashboard/laporan",
            icon: FileText,
            bg: "bg-green-50",
            iconColor: "text-green-600",
            title: "View My Reports",
            desc: "Track all your submitted reports",
          },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className="border border-gray-100 shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 ${action.bg} rounded-lg group-hover:scale-110 transition-transform duration-200`}
                  >
                    <action.icon size={18} className={action.iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-400 group-hover:translate-x-1 transition-transform duration-200"
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
