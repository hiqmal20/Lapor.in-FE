const DEFAULT_API_URL = "http://localhost:5000";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  DEFAULT_API_URL;

if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== "undefined") {
  console.warn(
    "NEXT_PUBLIC_API_URL is not set. Defaulting apiFetch to http://localhost:5000.",
  );
}

const normalizeEndpoint = (endpoint: string) => {
  if (endpoint.startsWith("/auth/")) {
    console.warn(
      `apiFetch: normalizing legacy auth endpoint ${endpoint} to /api/laporin${endpoint}`,
    );

    return endpoint.replace(/^\/auth/, "/api/laporin/auth");
  }

  return endpoint;
};

const parseJsonSafe = async (response: Response) => {
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";

  if (
    contentType.includes("application/json") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[")
  ) {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("API ERROR: failed to parse JSON response", {
        status: response.status,
        url: response.url,
        text,
        error,
      });

      return {
        message: "Invalid JSON response",
        raw: text,
      };
    }
  }

  console.error("API ERROR: non-JSON response received", {
    status: response.status,
    url: response.url,
    contentType,
    text,
  });

  return {
    message: "Non-JSON response received",
    raw: text,
  };
};

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  const url = normalizedEndpoint.startsWith("http")
    ? normalizedEndpoint
    : `${BASE_URL}${normalizedEndpoint}`;

  console.log("FINAL URL:", url);

  try {
    // 1. Ambil token langsung, atau cadangkan jika token disimpan di dalam objek user
    let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (!token && typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        token = JSON.parse(savedUser)?.token || null;
      }
    }

    // FIX DI SINI: Sesuaikan pengecekan dengan mencakup pola /api/laporin/auth/
    const isAuthRoute =
      normalizedEndpoint.includes("/auth/login") ||
      normalizedEndpoint.includes("/auth/register") ||
      normalizedEndpoint.includes("/api/laporin/auth/login") ||
      normalizedEndpoint.includes("/api/laporin/auth/register");

   // Menggunakan Record<string, string> agar properti bisa ditambah secara dinamis
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(options.headers as Record<string, string>),
};

// Hanya kirim token jika benar-benar bukan rute auth
if (token && !isAuthRoute) {
  headers["Authorization"] = `Bearer ${token}`;
}
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await parseJsonSafe(res);

    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (error) {
    console.error("API ERROR:", error);

    return {
      ok: false,
      status: 500,
      data: {
        message: "Internal client error",
      },
    };
  }
};