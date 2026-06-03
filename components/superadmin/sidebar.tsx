"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
// REVISI: Tambahkan ikon Radio untuk menu Duty Monitor
import { LayoutDashboard, Users, Radio, FileText, Tag, User, LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/superadmin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/users", label: "Manage Users", icon: Users },
  // TAMBAHAN MENU BARU: Menghubungkan langsung ke halaman duty monitor Anda
  { href: "/superadmin/duty-monitor", label: "Duty Monitor", icon: Radio },
  { href: "/superadmin/laporan", label: "Manage Reports", icon: FileText },
  { href: "/superadmin/categories", label: "Categories", icon: Tag },
  { href: "/superadmin/profil", label: "Profile", icon: User },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    clearAuth();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <aside className="w-44 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/laporin.png" alt="Logo" width={85} height={85} className="ml-5" />
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 ml-5">Public Complaint System</p>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? "S"}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 truncate w-24">{user?.name ?? "Super Admin"}</p>
            <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">Super Admin</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">System</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 w-full transition"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}