"use client";

import { X } from "lucide-react";
import type { NoteShare, SharePermission } from "@/app/types/note.types";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shareEmail: string;
  onShareEmailChange: (value: string) => void;
  sharePermission: SharePermission;
  onSharePermissionChange: (permission: SharePermission) => void;
  onInvite: () => void;
  isInvitePending: boolean;
  shareError: string | null;
  sharesErrorMessage: string | null;
  sharesLoading: boolean;
  shares: NoteShare[];
  meDisplayName: string;
  meInitials: string;
  meEmail?: string;
  isUpdatePending: boolean;
  updatingShareId: string | null;
  onPermissionChange: (shareUserId: string, permission: SharePermission) => void;
};

const getShareDisplayName = (share: NoteShare) =>
  share.name?.trim() || share.email?.trim() || share.user_id;

const getShareInitials = (label: string) => {
  const parts = label.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function ShareModal({
  isOpen,
  onClose,
  shareEmail,
  onShareEmailChange,
  sharePermission,
  onSharePermissionChange,
  onInvite,
  isInvitePending,
  shareError,
  sharesErrorMessage,
  sharesLoading,
  shares,
  meDisplayName,
  meInitials,
  meEmail,
  isUpdatePending,
  updatingShareId,
  onPermissionChange,
}: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-130 rounded-lg shadow-2xl overflow-hidden border border-slate-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Share Note</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-slate-50 rounded-lg border border-slate-200 px-3 py-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <input
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-400 py-2 outline-none"
                  placeholder="Add people by email..."
                  type="text"
                  value={shareEmail}
                  onChange={(event) => onShareEmailChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void onInvite();
                    }
                  }}
                />
                <select
                  className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 cursor-pointer pl-2 pr-8"
                  value={sharePermission}
                  onChange={(event) =>
                    onSharePermissionChange(
                      event.target.value as SharePermission,
                    )
                  }
                >
                  <option value="edit">Can edit</option>
                  <option value="view">Can view</option>
                </select>
              </div>
              <button
                onClick={() => void onInvite()}
                disabled={!shareEmail.trim() || isInvitePending}
                className={`bg-primary text-white text-sm font-bold px-6 py-2 rounded-lg shadow-lg shadow-primary/20 transition-all ${
                  !shareEmail.trim() || isInvitePending
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:opacity-95"
                }`}
              >
                {isInvitePending ? "Inviting..." : "Invite"}
              </button>
            </div>
            {(shareError || sharesErrorMessage) && (
              <p className="text-xs text-red-600">
                {shareError || sharesErrorMessage}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Collaborators
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {meInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {meDisplayName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {meEmail || "you@example.com"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Owner</span>
              </div>

              {sharesLoading && (
                <div className="text-xs text-slate-500">
                  Loading collaborators...
                </div>
              )}
              {!sharesLoading && shares.length === 0 && (
                <div className="text-xs text-slate-500">
                  No collaborators yet.
                </div>
              )}
              {shares.map((share) => {
                const displayName = getShareDisplayName(share);
                const initials = getShareInitials(displayName);
                const permissionValue =
                  share.permission === "edit" || share.permission === "view"
                    ? share.permission
                    : "view";
                const isUpdating =
                  isUpdatePending && updatingShareId === share.user_id;

                return (
                  <div
                    key={share.user_id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {share.email || share.user_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 cursor-pointer pl-2 pr-6"
                        value={permissionValue}
                        disabled={isUpdating}
                        onChange={(event) =>
                          void onPermissionChange(
                            share.user_id,
                            event.target.value as SharePermission,
                          )
                        }
                      >
                        <option value="edit">Can edit</option>
                        <option value="view">Can view</option>
                      </select>
                      {isUpdating && (
                        <span className="text-[11px] text-slate-400">
                          Updating...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white text-sm font-bold px-8 py-2.5 rounded-lg hover:opacity-90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
