"use client";

import { Bell, LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { authService } from "@/app/services/auth.service";
import type { CurrentUserData } from "@/app/types/auth.types";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<CurrentUserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    authService
      .me()
      .then((data) => {
        if (!active) return;
        setUser(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setUser(null);
        setError(err instanceof Error ? err.message : "Failed to load user");
      });

    return () => {
      active = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) return error ? "Unknown user" : "Loading...";
    if (user.username?.trim()) return user.username.trim();
    if (user.userId?.trim()) return user.userId.trim();
    if (user.email?.trim()) return user.email.split("@")[0];
    return "Unknown user";
  }, [user, error]);

  const displayEmail = user?.email?.trim() || (error ? "No email" : "...");

  const initials = useMemo(() => {
    const source = displayName || displayEmail;
    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    const letters = parts.slice(0, 2).map((part) => part[0]);
    return letters.join("").toUpperCase();
  }, [displayName, displayEmail]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authService.logout();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      <div className="flex-1" />

      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-600">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500">{displayEmail}</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              {initials}
            </div>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-2 z-10"
            >
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                role="menuitem"
              >
                <LogOut size={16} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
