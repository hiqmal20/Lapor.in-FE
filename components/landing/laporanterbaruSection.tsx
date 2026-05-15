"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const laporan = [
  {
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80",
    status: "Pending",
    category: "Road & Infrastructure",
    title: "Jalan Berlubang di Persimpangan",
    location: "Jl. Sudirman, Jakarta Pusat",
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    status: "Approved",
    category: "Public Safety",
    title: "Lampu Jalan Mati di Perumahan",
    location: "Perumahan Griya Indah, Depok",
  },
  {
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80",
    status: "Pending",
    category: "Environment",
    title: "Tumpukan Sampah di Pinggir Jalan",
    location: "Jl. Gatot Subroto, Bandung",
  },
  {
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    status: "Approved",
    category: "Water & Sanitation",
    title: "Saluran Air Tersumbat dan Meluap",
    location: "Jl. Kebon Jeruk, Jakarta Barat",
  },
];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  approved: "bg-green-100 text-green-700 hover:bg-green-100",
  rejected: "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function LaporanTerbaruSection() {
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
    <section ref={sectionRef} id="laporan" className="px-8 py-20">
      <div className="max-w-5xl mx-auto">
        <div className={`flex items-end justify-between mb-8 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Laporan Terbaru
            </h2>
            <p className="text-gray-500 text-sm">
              Keluhan terbaru dari warga sekitar.
            </p>
          </div>
          <Button asChild variant="link" className="text-blue-600 p-0 group">
            <Link href="/login" className="flex items-center gap-1">
              Lihat Semua
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {laporan.map((item, i) => (
            <Card
              key={i}
              className={`border border-gray-100 shadow-none hover-lift group cursor-pointer overflow-hidden ${
                visible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${200 + i * 150}ms` }}
            >
              <CardContent className="p-0">
                {/* image */}
                <div className="w-full h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.classList.add("bg-gray-200");
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                {/* content */}
                <div className="p-4">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Badge
                      className={`${statusColor[item.status.toLowerCase()] ?? ""} transition-transform duration-200 group-hover:scale-105`}
                      variant="secondary"
                    >
                      ● {item.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-200 transition-transform duration-200 group-hover:scale-105"
                    >
                      {item.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 transition-colors duration-200 group-hover:text-blue-600">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={11} />
                    {item.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}