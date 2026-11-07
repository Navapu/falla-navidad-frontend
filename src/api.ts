import type { User } from "./types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api").replace(/\/$/, "");
const TOKEN_KEY = "falla_navidad_token";

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? "No se ha podido completar la petición");
  return data as T;
}

export type AuthResponse = { token: string; user: User };
