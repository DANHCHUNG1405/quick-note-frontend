"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/app/services/auth.service";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Query lấy thông tin user
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.me(),
    // Không retry vì nếu lỗi 401 thì api.ts đã tự handle refresh token.
    // Nếu api.ts vẫn ném lỗi thì nghĩa là refresh token cũng hỏng => phải login lại.
    retry: false, 
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  // Mutation xử lý logout
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Xóa toàn bộ cache khi logout
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
      // Dù lỗi network hay gì thì cũng clear client state và về login
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
      router.push("/login");
    }
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
