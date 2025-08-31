"use client";
import axios from "axios";

// FUERZA /api (ignora NEXT_PUBLIC_API_URL en prod)
const baseURL = "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

// -- helpers de alto nivel --
export type MeResponse = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  profile?: Record<string, unknown> | null;
};

export async function getMe(): Promise<MeResponse | null> {
  try {
    const { data } = await api.get<MeResponse>("/users/me");
    return data;
  } catch (e: any) {
    if (e?.response?.status === 401) return null; // <- clave
    throw e;
  }
}

export async function postEmailLogin(payload: { email: string; password: string }) {
  const { data } = await api.post("/auth/email/login", payload);
  return data;
}

export async function postEmailRegister(payload: { email: string; password: string; displayName?: string }) {
  const { data } = await api.post("/auth/email/register", payload);
  return data;
}

export async function postSessionLogin(payload: { id_token: string }) {
  const { data } = await api.post("/auth/session/login", payload);
  return data;
}

export async function postLogout() {
  const { data } = await api.post("/auth/session/logout");
  return data;
}

export async function postUpdateProfile(payload: { displayName?: string; photoURL?: string }) {
  const { data } = await api.post("/users/me/profile", payload);
  return data;
}
