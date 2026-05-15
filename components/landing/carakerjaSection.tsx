"use client";
import { PenLine, Send, Loader, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: PenLine,
    title: "Buat Laporan",
    desc: "Isi detail masalah, lokasi, dan unggah foto pendukung.",
  },
  {
    icon: Send,
    title: "Kirim Laporan",
    desc: "Laporan langsung diteruskan ke instansi terkait.",
  },
  {
    icon: Loader,
    title: "Tindak Lanjut",
    desc: "Petugas meninjau dan mengambil tindakan sesuai prosedur.",
  },
  {
    icon: CheckCircle,
    title: "Selesai",
    desc: "Anda menerima notifikasi saat masalah telah ditangani.",
  },
];

export default function CaraKerjaSection() {
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
    <section ref={sectionRef} id="cara-kerja" className="px-8 py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-12 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Cara Kerja</h2>
          <p className="text-gray-500">
            Empat langkah sederhana dari pelaporan hingga penyelesaian.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <Card
              key={i}
              className={`relative border border-gray-100 shadow-none hover-lift group cursor-default ${
                visible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${200 + i * 150}ms` }}
            >
              {/* nomor step */}
              <div className="absolute -top-3 -right-3 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                {i + 1}
              </div>
              <CardContent className="p-6">
                <div className="text-gray-400 mb-4 transition-colors duration-300 group-hover:text-blue-600">
                  <step.icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}