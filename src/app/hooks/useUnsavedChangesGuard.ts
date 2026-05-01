"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PendingNavigation =
  | { type: "href"; href: string }
  | { type: "back" }
  | null;

type UseUnsavedChangesGuardOptions = {
  enabled: boolean;
  onSave: () => Promise<boolean>;
};

export function useUnsavedChangesGuard({
  enabled,
  onSave,
}: UseUnsavedChangesGuardOptions) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingNavigationRef = useRef<PendingNavigation>(null);
  const bypassGuardRef = useRef(false);

  const continueNavigation = useCallback((pending: PendingNavigation) => {
    if (!pending) return;

    bypassGuardRef.current = true;
    if (pending.type === "href") {
      router.push(pending.href);
      return;
    }

    window.history.back();
  }, [router]);

  const requestNavigation = useCallback((pending: PendingNavigation) => {
    if (!enabled || bypassGuardRef.current) {
      continueNavigation(pending);
      return;
    }

    pendingNavigationRef.current = pending;
    setDialogOpen(true);
  }, [continueNavigation, enabled]);

  const handleSaveAndLeave = useCallback(async () => {
    if (saving) return;

    setSaving(true);
    const success = await onSave().catch(() => false);
    setSaving(false);

    if (!success) {
      return;
    }

    setDialogOpen(false);
    const pending = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    continueNavigation(pending);
  }, [continueNavigation, onSave, saving]);

  const handleDiscard = useCallback(() => {
    setDialogOpen(false);
    const pending = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    continueNavigation(pending);
  }, [continueNavigation]);

  const handleCancel = useCallback(() => {
    pendingNavigationRef.current = null;
    setDialogOpen(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;

    window.history.pushState({ quicknoteGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (!enabled || bypassGuardRef.current) {
        return;
      }

      pendingNavigationRef.current = { type: "back" };
      setDialogOpen(true);
      window.history.pushState(
        { quicknoteGuard: true },
        "",
        window.location.href,
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (bypassGuardRef.current) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = anchor.href;
      if (!href.startsWith(window.location.origin)) {
        return;
      }

      const nextUrl = new URL(href);
      const currentUrl = new URL(window.location.href);
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

      if (nextPath === currentPath) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      requestNavigation({ type: "href", href: nextPath });
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [enabled, requestNavigation]);

  return {
    dialogOpen,
    saving,
    handleSaveAndLeave,
    handleDiscard,
    handleCancel,
  };
}
