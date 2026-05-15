"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/login";
import { FileText, Shield, Users } from "lucide-react";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT — branding */}
      <div className={`hidden lg:flex flex-col justify-between bg-[#0f1f3d] p-12 relative overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}>
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-blue-800/30 blur-[100px]" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-indigo-900/40 blur-[120px]" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Image src="/images/laporin.png" alt="Lapor.in" width={40} height={40} className="rounded-lg" />
          <div>
            <p className="text-white font-bold text-lg leading-none">Lapor.in</p>
            <p className="text-blue-300/60 text-xs">Public Complaint System</p>
          </div>
        </div>

        {/* center */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Suarakan<br />
              <span className="text-blue-400">Masalahmu.</span>
            </h1>
            <p className="text-blue-200/70 mt-4 text-base leading-relaxed max-w-sm">
              Platform pelaporan publik yang menghubungkan masyarakat dengan pemerintah secara langsung, cepat, dan transparan.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: FileText, title: "Lapor dengan mudah", desc: "Kirim laporan kapan saja, di mana saja" },
              { icon: Shield, title: "Aman & terpercaya", desc: "Data kamu terlindungi sepenuhnya" },
              { icon: Users, title: "Ditangani langsung", desc: "Admin merespons setiap laporan" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3" style={{ transitionDelay: `${200 + i * 100}ms` }}>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-blue-300/60 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
          {[{ value: "2.8K+", label: "Laporan" }, { value: "87%", label: "Respon" }, { value: "1.2K+", label: "Pengguna" }].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-blue-300/50 text-xs uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form */}
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}>
        <div className="w-full max-w-sm">
          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/images/laporin.png" alt="Lapor.in" width={28} height={28} className="rounded-lg" />
            <span className="font-bold text-gray-900">Lapor.in</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Selamat datang kembali</h2>
            <p className="text-sm text-gray-500 mt-1">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#0f1f3d] font-semibold hover:underline transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
