"use client";
import { useEffect, useState } from "react";
import type { User } from "@/types/memory";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then(setUser).catch(() => setUser(null));
  }, []);
  return user;
}