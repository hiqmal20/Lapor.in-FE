const BASE_URL = process.env.NEXT_PUBLIC_API_URL;



export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  console.log("FINAL URL:", `${BASE_URL}${endpoint}`);
  
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    const res = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
          ...options.headers,
        },
      }
    );

    const data = await res.json();

    if (res.status === 401) {
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