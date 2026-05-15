export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
}

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setAuth = (user: User, token: string) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
};

export const clearAuth = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// redirect sesuai role setelah login
export const redirectByRole = (role: string): string => {
  console.log("redirectByRole called with role:", role);
  switch (role) {
    case "super_admin":
      return "/superadmin/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/dashboard";
  }
};