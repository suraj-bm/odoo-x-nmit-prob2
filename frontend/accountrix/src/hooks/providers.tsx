"use client";

import { SessionProvider } from "next-auth/react";
import { ApiProvider } from "@/contexts/ApiContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApiProvider>
        {children}
      </ApiProvider>
    </SessionProvider>
  );
}
