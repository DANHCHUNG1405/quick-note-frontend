"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Bell,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading,
  Quote,
  CheckCircle,
  Share2,
  X,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TiptapLink from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/app/services/auth.service";
import { notesService } from "@/app/services/notes.service";
import type { CurrentUserData } from "@/app/types/auth.types";
import {
  Note,
  NoteShare,
  SharePermission,
  UpdateNotePayload,
} from "@/app/types/note.types";
import { topicsService } from "@/app/services/topic.service";
import type { TopicNode } from "@/app/types/topic.types";

export default function NoteEditorPage() {
  const params = useParams();
  const noteId = params.id as string;

  const isCreateMode = noteId === "new";

  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] =
    useState<SharePermission>("edit");
  const [shareError, setShareError] = useState<string | null>(null);
  const [updatingShareId, setUpdatingShareId] = useState<string | null>(null);

  /*
  const [shareLink, setShareLink] = useState("");
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(true);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  */

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(isDirty);
  const isSavingRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  /*
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isCreateMode || !noteId) return;
    setShareLink(`${window.location.origin}/notes/${noteId}`);
  }, [isCreateMode, noteId]);
  */

  useEffect(() => {
    if (!isShareOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsShareOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isShareOpen]);

  useEffect(() => {
    if (isShareOpen) return;
    setShareEmail("");
    setShareError(null);
    setSharePermission("edit");
  }, [isShareOpen]);

  const queryClient = useQueryClient();

  const meQuery = useQuery<CurrentUserData, Error>({
    queryKey: ["me"],
    queryFn: () => authService.me(),
    enabled: isShareOpen,
  });

  const noteQuery = useQuery<Note, Error>({
    queryKey: ["note", noteId],
    queryFn: () => notesService.getById(noteId),
    enabled: !isCreateMode && !!noteId,
  });

  const topicId = noteQuery.data?.topic_id ?? null;
  const topicsQuery = useQuery<TopicNode[], Error>({
    queryKey: ["topics", "tree"],
    queryFn: () => topicsService.getTree(),
    enabled: !!topicId,
  });

  const sharesQuery = useQuery<NoteShare[], Error>({
    queryKey: ["note-shares", noteId],
    queryFn: () => notesService.listShares(noteId),
    enabled: isShareOpen && !isCreateMode && !!noteId,
  });

  const shareNoteMutation = useMutation({
    mutationFn: (payload: { email: string; permission: SharePermission }) =>
      notesService.shareNote(noteId, payload),
    onSuccess: () => {
      setShareEmail("");
      setShareError(null);
      queryClient.invalidateQueries({ queryKey: ["note-shares", noteId] });
    },
    onError: (error) => {
      setShareError(error instanceof Error ? error.message : "Share failed");
    },
  });

  const updateShareMutation = useMutation({
    mutationFn: (payload: {
      shareUserId: string;
      permission: SharePermission;
    }) =>
      notesService.updateSharePermission(noteId, payload.shareUserId, {
        permission: payload.permission,
      }),
    onMutate: (payload) => {
      setUpdatingShareId(payload.shareUserId);
      setShareError(null);
    },
    onSettled: () => {
      setUpdatingShareId(null);
      queryClient.invalidateQueries({ queryKey: ["note-shares", noteId] });
    },
    onError: (error) => {
      setShareError(
        error instanceof Error ? error.message : "Update permission failed",
      );
    },
  });

  const updateNoteMutation = useMutation<Note, Error, UpdateNotePayload>({
    mutationFn: (payload) => notesService.update(noteId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["note", noteId], updated);
      if (updated.updated_at) {
        setLastSavedAt(new Date(updated.updated_at));
      } else {
        setLastSavedAt(new Date());
      }
      setIsDirty(false);
    },
  });

  useEffect(() => {
    isSavingRef.current = updateNoteMutation.isPending;
  }, [updateNoteMutation.isPending]);

  useEffect(() => {
    if (!noteQuery.data) return;
    setTitle(noteQuery.data.title || "");
    setIsDirty(false);
    if (noteQuery.data.updated_at) {
      setLastSavedAt(new Date(noteQuery.data.updated_at));
    }
  }, [noteQuery.data]);

  const initialContent = useMemo(() => {
    if (isCreateMode) return "<p></p>";

    return "<p></p>";
  }, [isCreateMode]);

  const topicPath = useMemo(() => {
    if (!topicId || !topicsQuery.data) return [];

    const findPath = (
      nodes: TopicNode[],
      targetId: string,
    ): TopicNode[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return [node];
        }
        if (node.children?.length) {
          const childPath = findPath(node.children, targetId);
          if (childPath) {
            return [node, ...childPath];
          }
        }
      }
      return null;
    };

    return findPath(topicsQuery.data, topicId) ?? [];
  }, [topicId, topicsQuery.data]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Strike,
      Highlight,
      TiptapLink,
      Image,
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none text-lg leading-relaxed outline-none min-h-[500px] text-slate-800",
      },
    },
  });

  const saveNote = useCallback(async () => {
    if (isCreateMode || !noteId || !editor) return;
    if (isSavingRef.current || !isDirtyRef.current) return;

    try {
      const content = editor.getHTML();
      const payload: UpdateNotePayload = {
        title: title.trim() || "Untitled",
        content,
      };
      await updateNoteMutation.mutateAsync(payload);
    } catch {
      // Error state is handled by the mutation object.
    }
  }, [editor, isCreateMode, noteId, title, updateNoteMutation]);

  const scheduleAutosave = useCallback(() => {
    if (isCreateMode || !noteId) return;
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      void saveNote();
    }, 10000);
  }, [isCreateMode, noteId, saveNote]);

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!editor) return;
    if (isCreateMode) return;
    if (!noteQuery.data) return;

    const content =
      noteQuery.data.content && noteQuery.data.content.trim().length > 0
        ? noteQuery.data.content
        : "<p></p>";
    editor.commands.setContent(content, {
      emitUpdate: false,
    });
  }, [editor, isCreateMode, noteQuery.data]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setIsDirty(true);
      scheduleAutosave();
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, scheduleAutosave]);

  const wordCount =
    editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0;
  const charCount = editor?.getText().length || 0;

  const createdAtLabel = noteQuery.data?.created_at
    ? new Date(noteQuery.data.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const isLoading = !isCreateMode && noteQuery.isLoading;
  const errorMessage =
    noteQuery.error?.message || updateNoteMutation.error?.message || null;

  const shares = useMemo(() => {
    const items = sharesQuery.data ?? [];
    const currentUserId = meQuery.data?.userId;
    if (!currentUserId) return items;
    return items.filter((share) => share.user_id !== currentUserId);
  }, [meQuery.data?.userId, sharesQuery.data]);

  const meDisplayName = useMemo(() => {
    const user = meQuery.data;
    if (!user) return "You";
    if (user.fullname?.trim()) return user.fullname.trim();
    if (user.email?.trim()) return user.email.split("@")[0];
    return "You";
  }, [meQuery.data]);

  const meInitials = useMemo(() => {
    const source = meDisplayName || meQuery.data?.email || "You";
    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [meDisplayName, meQuery.data?.email]);

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

  const handleInvite = useCallback(async () => {
    if (shareNoteMutation.isPending) return;
    const email = shareEmail.trim();
    if (!email) {
      setShareError("Please enter an email.");
      return;
    }
    try {
      await shareNoteMutation.mutateAsync({
        email,
        permission: sharePermission,
      });
    } catch {
      // Error is handled by mutation callbacks.
    }
  }, [shareEmail, shareNoteMutation, sharePermission]);

  const handlePermissionChange = useCallback(
    async (shareUserId: string, permission: SharePermission) => {
      if (updateShareMutation.isPending) return;
      try {
        await updateShareMutation.mutateAsync({ shareUserId, permission });
      } catch {
        // Error is handled by mutation callbacks.
      }
    },
    [updateShareMutation],
  );

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200">
        <div className="text-sm text-slate-600 flex items-center flex-wrap gap-1">
          {topicPath.length > 0 ? (
            <>
              {topicPath.map((topic) => (
                <span key={topic.id} className="flex items-center gap-1">
                  <Link
                    href={`/topics/${topic.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {topic.name}
                  </Link>
                  <span className="text-slate-400">/</span>
                </span>
              ))}
            </>
          ) : (
            !isCreateMode && (
              <span className="text-slate-400">
                {topicsQuery.isLoading ? "Loading..." : "No topic"}
              </span>
            )
          )}
          <span className="text-slate-900 font-semibold">
            {isCreateMode ? "New Note" : title || "Untitled"}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search notes..."
              className="pl-10 pr-4 py-1.5 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none w-64"
            />
          </div>

          <button className="relative text-slate-500 hover:text-slate-700">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* EDITOR CORE */}
      <div className="flex-1 overflow-y-auto px-8 pt-12 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* TITLE */}
          <div className="mb-10 flex items-start justify-between">
            <div className="flex-1">
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setIsDirty(true);
                  scheduleAutosave();
                }}
                placeholder="Note Title"
                className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300 mb-2 outline-none text-slate-900"
              />

              <div className="flex items-center gap-4 text-xs text-slate-500">
                {createdAtLabel && <span>{createdAtLabel}</span>}
                {!isCreateMode && (
                  <span>
                    {Math.max(1, Math.ceil(wordCount / 200))} min read
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isCreateMode && (
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <Share2 size={14} />
                  Share
                </button>
              )}
              {!isCreateMode && !isLoading && !errorMessage && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-100">
                  <CheckCircle size={14} />
                  {updateNoteMutation.isPending
                    ? "Saving..."
                    : isDirty
                      ? "Unsaved"
                      : "Saved"}
                </span>
              )}
              {!isCreateMode && (
                <button
                  onClick={() => void saveNote()}
                  disabled={updateNoteMutation.isPending || !isDirty}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    updateNoteMutation.isPending || !isDirty
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-primary text-white border-primary hover:brightness-110"
                  }`}
                >
                  {updateNoteMutation.isPending ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>

          {/* TOOLBAR */}
          <EditorToolbar editor={editor} />

          {/* CANVAS */}
          <div className="mt-8">
            {errorMessage && (
              <div className="mb-4 text-sm text-red-600">{errorMessage}</div>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="h-10 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-8 text-xs text-slate-600">
        <span>
          {wordCount} words - {charCount} characters
        </span>
        <span className="flex items-center gap-4">
          {lastSavedAt && (
            <span>
              Last saved{" "}
              {lastSavedAt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Connected
          </span>
        </span>
      </footer>

      {isShareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setIsShareOpen(false)}
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
                onClick={() => setIsShareOpen(false)}
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
                      onChange={(event) => {
                        setShareEmail(event.target.value);
                        if (shareError) setShareError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleInvite();
                        }
                      }}
                    />
                    <select
                      className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 cursor-pointer pl-2 pr-8"
                      value={sharePermission}
                      onChange={(event) =>
                        setSharePermission(
                          event.target.value as SharePermission,
                        )
                      }
                    >
                      <option value="edit">Can edit</option>
                      <option value="view">Can view</option>
                    </select>
                  </div>
                  <button
                    onClick={() => void handleInvite()}
                    disabled={!shareEmail.trim() || shareNoteMutation.isPending}
                    className={`bg-primary text-white text-sm font-bold px-6 py-2 rounded-lg shadow-lg shadow-primary/20 transition-all ${
                      !shareEmail.trim() || shareNoteMutation.isPending
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:opacity-95"
                    }`}
                  >
                    {shareNoteMutation.isPending ? "Inviting..." : "Invite"}
                  </button>
                </div>
                {(shareError || sharesQuery.error) && (
                  <p className="text-xs text-red-600">
                    {shareError ||
                      (sharesQuery.error instanceof Error
                        ? sharesQuery.error.message
                        : "Share action failed.")}
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
                          {meQuery.data?.email || "you@example.com"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      Owner
                    </span>
                  </div>

                  {sharesQuery.isLoading && (
                    <div className="text-xs text-slate-500">
                      Loading collaborators...
                    </div>
                  )}
                  {!sharesQuery.isLoading && shares.length === 0 && (
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
                      updateShareMutation.isPending &&
                      updatingShareId === share.user_id;

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
                              void handlePermissionChange(
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

              {/*
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Public Access
                      </p>
                      <p className="text-xs text-slate-500">
                        Anyone with the link can view
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPublicAccessEnabled((current) => !current)
                    }
                    className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                      publicAccessEnabled ? "bg-primary" : "bg-slate-300"
                    }`}
                    aria-pressed={publicAccessEnabled}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow-sm transition-all ${
                        publicAccessEnabled ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                  <Link2 size={14} className="text-slate-400 ml-1" />
                  <span className="flex-1 text-xs text-slate-500 truncate">
                    {shareLink || "Link will be available after saving"}
                  </span>
                  <button
                    onClick={() => void handleCopyLink()}
                    disabled={!shareLink}
                    className="text-[11px] font-bold text-primary px-3 py-1 hover:bg-indigo-50 rounded transition-colors uppercase tracking-wider disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    {copyStatus === "copied" ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>
              */}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsShareOpen(false)}
                className="bg-slate-900 text-white text-sm font-bold px-8 py-2.5 rounded-lg hover:opacity-90 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      underline: editor?.isActive("underline") ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      orderedList: editor?.isActive("orderedList") ?? false,
      heading: editor?.isActive("heading", { level: 2 }) ?? false,
      blockquote: editor?.isActive("blockquote") ?? false,
      strike: editor?.isActive("strike") ?? false,
      highlight: editor?.isActive("highlight") ?? false,
    }),
  });

  if (!editor) return null;

  const Button = ({
    onClick,
    active,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="sticky top-4 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-sm px-2 py-1.5 flex items-center gap-1 w-max">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editorState?.bold}
      >
        <Bold size={18} />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editorState?.italic}
      >
        <Italic size={18} />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editorState?.underline}
      >
        <Underline size={18} />
      </Button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <Button
        onClick={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
        active={editorState?.bulletList}
      >
        <List size={18} />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editorState?.orderedList}
      >
        <ListOrdered size={18} />
      </Button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editorState?.heading}
      >
        <Heading size={18} />
      </Button>

      <Button
        onClick={() => {
          console.log("before:", editor.isActive("blockquote"));
          editor.chain().focus().toggleBlockquote().run();
          console.log("after:", editor.isActive("blockquote"));
        }}
        active={editorState?.blockquote}
      >
        <Quote size={18} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editorState?.strike}
      >
        S
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editorState?.highlight}
      >
        H
      </Button>
      <Button
        onClick={() => {
          const url = prompt("Enter URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        🔗
      </Button>
      <Button
        onClick={() => {
          const url = prompt("Image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
      >
        🖼
      </Button>
      <Button onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        Left
      </Button>

      <Button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        Center
      </Button>

      <Button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        Right
      </Button>
    </div>
  );
}
