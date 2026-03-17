"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/auth.service";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    authService
      .me()
      .then(() => {
        if (!active) return;
        setChecked(true);
      })
      .catch(() => {
        if (!active) return;
        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
