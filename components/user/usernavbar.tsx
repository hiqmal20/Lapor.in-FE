"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserNavbar() {
  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {};

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
        <p className="text-xs text-gray-400">Welcome back, {user?.name || "User"}!</p>
      </div>

      <div className="flex items-center gap-3">
        {/* notifikasi */}
        <button className="relative p-2 rounded-lg hover:bg-gray-50">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-semibold text-gray-900">{user?.name || "User"}</p>
            <p className="text-xs text-gray-400">User</p>
          </div>
        </div>
      </div>
    </header>
  );
}