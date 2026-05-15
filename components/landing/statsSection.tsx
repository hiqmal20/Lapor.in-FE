"use client";
import { FileText, CheckCheck, Users, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

const stats = [
  { icon: FileText, value: "2.847", label: "Laporan Masuk" },
  { icon: CheckCheck, value: "1.932", label: "Sudah Ditindak" },
  { icon: Users, value: "1.210", label: "Pengguna Aktif" },
  { icon: BarChart3, value: "87%", label: "Tingkat Respon" },
];

export default function StatsSection() {
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
    <section ref={sectionRef} className="bg-gray-50 px-8 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className={`border-0 shadow-none bg-transparent hover-lift cursor-default ${
              visible ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="text-blue-600 icon-float">
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}