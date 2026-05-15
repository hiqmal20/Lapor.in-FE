"use client";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-12">
        {/* Left: Text Content */}
        <div className="flex-1 min-w-0">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6 animate-fade-in-up">
            Laporkan Masalah di Sekitar Anda
          </h1>
          <p className="text-gray-500 text-base mb-8 max-w-lg leading-relaxed animate-fade-in-up delay-200">
            Lapor.in menghubungkan warga dengan pihak berwenang. Sampaikan keluhan
            jalan rusak, sampah menumpuk, lampu mati, dan masalah lainnya secara
            mudah dan transparan.
          </p>
          <div className="flex gap-3 animate-fade-in-up delay-400">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 hover-press group"
            >
              <Link href="/login" className="flex items-center gap-2">
                <Plus
                  size={16}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />
                Buat Laporan
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="hover-press group"
            >
              <Link href="#laporan" className="flex items-center gap-2">
                Lihat Laporan Warga
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: Hero Image with fade edges */}
        <div className="flex-1 relative animate-fade-in delay-300">
          <div className="relative w-full aspect-square max-w-[480px] ml-auto">
            {/* Fade mask - fades on all edges */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                maskImage:
                  "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)",
              }}
            >
              <Image
                src="/hero-illustration.png"
                alt="Ilustrasi platform Lapor.in"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Subtle glow behind the image */}
            <div className="absolute inset-0 bg-blue-100/30 rounded-full blur-3xl scale-75" />
          </div>
        </div>
      </div>
    </section>
  );
}