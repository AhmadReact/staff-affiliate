"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface RequireAuthProps {
  children: ReactNode;
  allowedUserTypes?: string[];
}

export default function RequireAuth({
  children,
  allowedUserTypes,
}: RequireAuthProps) {
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
      return;
    }

    if (allowedUserTypes && user) {
      const isAllowed = allowedUserTypes.includes(user.user_type);

      if (!isAllowed) {
        if (user.user_type === "staff") {
          router.replace("/admin-dashboard/customers");
        } else if (user.user_type === "customer") {
          router.replace("/customer-dashboard");
        } else {
          router.replace("/");
        }
      }
    }
  }, [accessToken, allowedUserTypes, router, user]);

  if (!accessToken) {
    return null;
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
    return null;
  }

  return <>{children}</>;
}

