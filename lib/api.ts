export class ApiError extends Error {
  constructor(message: string, public status: number, public type?: string) { super(message); }
}

/** Small fetch wrapper for our own route handlers. Throws ApiError on any non-2xx response. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const expired = res.status === 401 && data.type !== "user_reauthentication_required";
    if (expired && typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) window.location.href = "/login";
    throw new ApiError(data.error ?? "Something went wrong. Try again.", res.status, data.type);
  }
  return data as T;
}