"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { setAuth, redirectByRole } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { ok, data } = await apiFetch("/api/laporin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!ok) {
        setError(data.message || "Login gagal");
        return;
      }

      // simpan token & user ke localStorage
      setAuth(data.user, data.token);

      // simpan juga ke cookie untuk middleware
      document.cookie = `token=${data.token}; path=/`;
      document.cookie = `role=${data.user.role}; path=/`;

      // redirect otomatis sesuai role
      router.push(redirectByRole(data.user.role));
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
        <p className="text-center text-sm text-gray-500">
        Masukkan email dan password untuk melanjutkan
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#0f1f3d] hover:bg-[#1a3260] text-white"
          disabled={loading}
        >
          {loading ? "Memuat..." : "Masuk"}
        </Button>
      </div>
    </form>
  );
}