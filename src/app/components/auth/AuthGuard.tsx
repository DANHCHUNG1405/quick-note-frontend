"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isError } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-[#656487] font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Nếu có lỗi (unauthorized) hoặc chưa xác thực
  if (isError || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
