"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export function RouteGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, loginRequired } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loginRequired && !isLoggedIn && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loginRequired, isLoggedIn, pathname, router]);

  if (loginRequired && !isLoggedIn && pathname !== "/login") return null;

  return <>{children}</>;
}
