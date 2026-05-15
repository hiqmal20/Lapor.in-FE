import api from "@/lib/axios";

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
    const response = await api.post("/auth/laporin/register", payload);
    return response.data;
}

export const loginUser = async (payload: LoginPayload) => {
    const response = await api.post("/auth/laporin/login", payload);
    return response.data;
}