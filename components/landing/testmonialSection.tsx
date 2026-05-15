"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote:
      "Saya laporkan lampu jalan mati dan dalam 2 hari sudah diperbaiki. Prosesnya transparan dan saya bisa pantau dari awal sampai selesai.",
    name: "Dewi Kusuma",
    role: "Warga Kelurahan",
    initials: "DK",
  },
  {
    quote:
      "Lapor.in mengubah cara lingkungan kami menangani masalah. Dulu keluhan tercecer, sekarang semua terdata dan bisa ditindaklanjuti.",
    name: "Budi Santoso",
    role: "Ketua RT 05",
    initials: "BS",
  },
  {
    quote:
      "Sebagai petugas, platform ini memberikan visibilitas real-time atas apa yang paling dibutuhkan warga. Respon kami jadi lebih cepat.",
    name: "Ani Wulandari",
    role: "Staff Kelurahan",
    initials: "AW",
  },
];

export default function TestimonialSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="px-8 py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-12 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Apa Kata Mereka
          </h2>
          <p className="text-gray-500">
            Pengalaman warga dan petugas yang menggunakan Lapor.in.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className={`border border-gray-100 shadow-none hover-lift group cursor-default ${
                visible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${200 + i * 150}ms` }}
            >
              <CardContent className="p-6">
                <p className="text-blue-300 text-4xl font-serif mb-3 transition-colors duration-300 group-hover:text-blue-500">
                  &ldquo;
                </p>
                <p className="text-gray-600 text-sm mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 bg-blue-600 transition-transform duration-300 group-hover:scale-110">
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}