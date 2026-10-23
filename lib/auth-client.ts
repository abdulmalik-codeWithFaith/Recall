import type { ForgotValues, LoginValues, RegisterValues } from "./validation/auth";

/** Browser-side helpers. They call our own route handlers (built next), never Appwrite with a secret key. */
async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
  return data as T;
}

export const login = (v: LoginValues) => post("/api/auth/login", v);
export const register = (v: Omit<RegisterValues, "confirmPassword">) => post("/api/auth/register", v);
export const requestRecovery = (v: ForgotValues) => post("/api/auth/recovery", v);
export const logout = () => post("/api/auth/logout", {});