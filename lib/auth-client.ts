import { api } from "./api";

export const logout = () => api("/api/auth/logout", { method: "POST", body: "{}" });