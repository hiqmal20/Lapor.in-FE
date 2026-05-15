import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3 group">
              <div className="p-1.5 rounded-lg transition-transform duration-300 group-hover:rotate-12">
                <div className="">
                  <Image src="/images/laporin.png" alt="Logo" width={50} height={50} />
                </div>
              </div>
              <span className="font-bold text-gray-900">Lapor.in</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Platform pengaduan masyarakat yang menghubungkan warga dengan pihak berwenang.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Laporan
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Kategori
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Tentang
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Kontak
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900 transition-colors duration-200 link-underline">
                  Syarat Layanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">© 2026 Lapor.in. Hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <span className="text-gray-400 text-sm font-medium cursor-pointer hover:text-gray-600 transition-all duration-200 hover:scale-110">
              𝕏
            </span>
            <span className="text-gray-400 text-sm font-medium cursor-pointer hover:text-gray-600 transition-all duration-200 hover:scale-110">
              in
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}