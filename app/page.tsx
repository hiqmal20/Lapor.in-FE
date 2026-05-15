import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/statsSection";
import CaraKerjaSection from "@/components/landing/carakerjaSection";
import LaporanTerbaruSection from "@/components/landing/laporanterbaruSection";
import TestimonialSection from "@/components/landing/testmonialSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <CaraKerjaSection />
      <LaporanTerbaruSection />
      <TestimonialSection />
      <Footer />
    </main>
  );
}