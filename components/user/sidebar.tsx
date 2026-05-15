"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText, PlusSquare, User, LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/laporan", label: "My Reports", icon: FileText },
  { href: "/dashboard/laporan/buat", label: "Create Report", icon: PlusSquare },
  { href: "/dashboard/profil", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    router.push("/login");
  };

  // ambil user dari localStorage
  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {};

  return (
    <aside className="w-44 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1 rounded-lg">
            <Image src="/images/laporin.png" alt="Logo" width={85} height={85} className="ml-5"/>
          </div>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 ml-5">Public Complaint System</p>
      </div>

      {/* user info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 truncate w-24">{user?.name || "User"}</p>
            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
              Citizen
            </span>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">Navigation</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
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

      {/* logout */}
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