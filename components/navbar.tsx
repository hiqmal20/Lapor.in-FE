"use client";
import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`w-full px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50 navbar-blur ${
        scrolled ? "navbar-scrolled" : "bg-white"
      }`}
    >
      <Link href="" className="flex items-center gap-2 group">
        <div className="text-white p-1.5 rounded-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
          <Image src="/images/laporin.png" alt="Logo" width={50} height={50} />
        </div>
        <span className="font-bold text-lg text-gray-900">Lapor.in</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link
          href="#cara-kerja"
          className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200 link-underline"
        >
          Cara Kerja
        </Link>
        <Link
          href="#laporan"
          className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200 link-underline"
        >
          Laporan
        </Link>
        <Link
          href="/login"
          className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200 link-underline"
        >
          Masuk
        </Link>
        <Button asChild className="hover-press">
          <Link href="/register">Daftar</Link>
        </Button>
      </div>
    </nav>
  );
}