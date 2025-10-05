"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/"); // redirect to home if not logged in
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  if (!mounted || !authenticated) return null; // hide content until auth is checked
  return <>{children}</>;
}
