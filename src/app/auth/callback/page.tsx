"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/app/lib/authToken";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isProcessed = useRef(false);

  useEffect(() => {
    if (isProcessed.current) return;
    isProcessed.current = true;

    const accessToken = searchParams.get("access_token");

    if (accessToken) {
      // 1. Lưu token vào bộ nhớ (authToken.ts)
      setAccessToken(accessToken);

      // 2. Xóa cache của user cũ để force fetch `/auth/me` với token mới
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      // 3. Chuyển hướng người dùng vào trong app (ví dụ: /notes)
      router.replace("/");
    } else {
      router.replace("/login?error=auth_failed");
    }
  }, [router, searchParams, queryClient]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background-light">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-[#656487] font-medium text-sm">
          Authenticating with Google...
        </p>
      </div>
    </div>
  );
}
