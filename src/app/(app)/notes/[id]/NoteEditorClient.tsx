"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import type { NoteViewer } from "@/app/types/note-presence.types";
import { topicsService } from "@/app/services/topic.service";
import type { TopicNode } from "@/app/types/topic.types";
import NoteHeader from "./components/NoteHeader";
import NoteTitleSection from "./components/NoteTitleSection";
import EditorToolbar from "@/app/components/notes/EditorToolbar";
import NoteFooter from "@/app/components/notes/NoteFooter";
import NoteViewers from "@/app/components/notes/NoteViewers";
import ShareModal from "./components/ShareModal";
import RelatedTodos from "@/app/components/todos/RelatedTodos";
import RelatedTodoGroups from "@/app/components/todos/RelatedTodoGroups";
import UnsavedChangesDialog from "@/app/components/notes/UnsavedChangesDialog";
import { useNoteViewers } from "@/app/hooks/useNoteViewers";
import { useUnsavedChangesGuard } from "@/app/hooks/useUnsavedChangesGuard";

export default function NoteEditorClient({ noteId }: { noteId: string }) {

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
    enabled: !isCreateMode || isShareOpen,
  });
  const currentUserId = meQuery.data?.userId ?? null;

  const notePresence = useNoteViewers(isCreateMode ? null : noteId);

  const noteQuery = useQuery<Note, Error>({
    queryKey: ["note", noteId],
    queryFn: () => notesService.getById(noteId),
    enabled: !isCreateMode && !!noteId,
  });

  const sharedNotesQuery = useQuery<Note[], Error>({
    queryKey: ["notes", "shared"],
    queryFn: () => notesService.getSharedWithMe(),
    enabled: !isCreateMode && !!noteId && !!currentUserId,
    retry: false,
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
    enabled: !isCreateMode && !!noteId,
    retry: false,
  });

  const noteOwnerId =
    noteQuery.data?.user_id ?? noteQuery.data?.owner_id ?? null;
  const sharedNote = sharedNotesQuery.data?.find((note) => note.id === noteId);
  const notePermission =
    noteQuery.data?.permission ??
    noteQuery.data?.share_permission ??
    sharedNote?.permission ??
    sharedNote?.share_permission ??
    null;
  const normalizedNotePermission =
    typeof notePermission === "string"
      ? notePermission.toLowerCase()
      : notePermission;
  const isNoteOwner =
    !!currentUserId && !!noteOwnerId && currentUserId === noteOwnerId;
  const canShareNote = (() => {
    if (isCreateMode || !noteQuery.data) return false;
    if (typeof noteQuery.data.can_share === "boolean") {
      return noteQuery.data.can_share;
    }
    return isNoteOwner || sharesQuery.isSuccess;
  })();
  const canEditNote = (() => {
    if (isCreateMode || !noteQuery.data) return false;
    if (typeof noteQuery.data.can_edit === "boolean") {
      return noteQuery.data.can_edit;
    }
    return isNoteOwner || canShareNote || normalizedNotePermission === "edit";
  })();

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
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none text-lg leading-relaxed outline-none min-h-[500px] text-slate-800",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(canEditNote);
  }, [canEditNote, editor]);

  const saveNote = useCallback(async () => {
    if (isCreateMode || !noteId || !editor) return;
    if (!canEditNote) return false;
    if (isSavingRef.current || !isDirtyRef.current) return;

    try {
      const content = editor.getHTML();
      const payload: UpdateNotePayload = {
        title: title.trim() || "Untitled",
        content,
      };
      await updateNoteMutation.mutateAsync(payload);
      return true;
    } catch {
      return false;
    }
  }, [canEditNote, editor, isCreateMode, noteId, title, updateNoteMutation]);

  const unsavedChangesGuard = useUnsavedChangesGuard({
    enabled: isDirty,
    onSave: async () => {
      if (!isDirtyRef.current) return true;
      return (await saveNote()) ?? false;
    },
  });

  const handleTitleChange = useCallback(
    (value: string) => {
      if (!canEditNote) return;
      setTitle(value);
      setIsDirty(true);
    },
    [canEditNote],
  );

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
      if (!canEditNote) return;
      setIsDirty(true);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [canEditNote, editor]);

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
  const saveLabel = updateNoteMutation.isPending ? "Saving..." : "Save";
  const saveDisabled = updateNoteMutation.isPending || !isDirty || !canEditNote;
  const showSave = !isCreateMode && canEditNote && !isLoading && !errorMessage;
  const showShare = canShareNote && !isLoading && !errorMessage;
  const sharesErrorMessage =
    isShareOpen && sharesQuery.error instanceof Error
      ? sharesQuery.error.message
      : isShareOpen && sharesQuery.error
        ? "Share action failed."
        : null;

  const shares = useMemo(() => {
    const items = sharesQuery.data ?? [];
    if (!currentUserId) return items;
    return items.filter((share) => share.user_id !== currentUserId);
  }, [currentUserId, sharesQuery.data]);

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

  const presenceViewers = useMemo<NoteViewer[]>(() => {
    const currentViewerId = meQuery.data?.userId;
    const seen = new Set<string>();
    return notePresence.viewers.filter((viewer) => {
      if (currentViewerId && viewer.id === currentViewerId) return false;
      if (seen.has(viewer.id)) return false;
      seen.add(viewer.id);
      return true;
    });
  }, [meQuery.data?.userId, notePresence.viewers]);

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

  const handleShareEmailChange = useCallback((value: string) => {
    setShareEmail(value);
    setShareError(null);
  }, []);

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
      <NoteHeader
        topicPath={topicPath}
        isCreateMode={isCreateMode}
        title={title}
        topicsLoading={topicsQuery.isLoading}
      />

      {/* EDITOR CORE */}
      <div className="flex-1 overflow-y-auto px-8 pt-12 pb-20">
        <div className="max-w-3xl mx-auto">
          <NoteTitleSection
            title={title}
            onTitleChange={handleTitleChange}
            createdAtLabel={createdAtLabel}
            isCreateMode={isCreateMode}
            wordCount={wordCount}
            showShare={showShare}
            onShare={() => setIsShareOpen(true)}
            showSave={showSave}
            onSave={() => void saveNote()}
            saveDisabled={saveDisabled}
            saveLabel={saveLabel}
            viewersNode={
              <NoteViewers
                viewers={presenceViewers}
                currentUserId={meQuery.data?.userId}
                error={notePresence.error}
              />
            }
          />

          {/* TOOLBAR */}
          {canEditNote && <EditorToolbar editor={editor} />}

          {/* CANVAS */}
          <div className="mt-8">
            {errorMessage && (
              <div className="mb-4 text-sm text-red-600">{errorMessage}</div>
            )}
            <EditorContent editor={editor} />
          </div>

          {!isCreateMode && noteId && (
            <>
              <RelatedTodoGroups
                noteId={noteId}
                topicId={noteQuery.data?.topic_id}
              />
              <RelatedTodos
                noteId={noteId}
                topicId={noteQuery.data?.topic_id}
              />
            </>
          )}
        </div>
      </div>

      <NoteFooter
        wordCount={wordCount}
        charCount={charCount}
        lastSavedAt={lastSavedAt}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareEmail={shareEmail}
        onShareEmailChange={handleShareEmailChange}
        sharePermission={sharePermission}
        onSharePermissionChange={setSharePermission}
        onInvite={() => void handleInvite()}
        isInvitePending={shareNoteMutation.isPending}
        shareError={shareError}
        sharesErrorMessage={sharesErrorMessage}
        sharesLoading={sharesQuery.isLoading}
        shares={shares}
        meDisplayName={meDisplayName}
        meInitials={meInitials}
        meEmail={meQuery.data?.email}
        isUpdatePending={updateShareMutation.isPending}
        updatingShareId={updatingShareId}
        onPermissionChange={(shareUserId, permission) =>
          void handlePermissionChange(shareUserId, permission)
        }
      />

      <UnsavedChangesDialog
        open={unsavedChangesGuard.dialogOpen}
        saving={unsavedChangesGuard.saving}
        onSave={() => void unsavedChangesGuard.handleSaveAndLeave()}
        onDiscard={unsavedChangesGuard.handleDiscard}
        onCancel={unsavedChangesGuard.handleCancel}
      />
    </div>
  );
}


