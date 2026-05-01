"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { useMutation } from "@tanstack/react-query";
import { notesService } from "@/app/services/notes.service";
import { CreateNotePayload, Note } from "@/app/types/note.types";
import NoteHeader from "./components/NoteHeader";
import NewNoteTitleSection from "./components/NewNoteTitleSection";
import EditorToolbar from "@/app/components/notes/EditorToolbar";
import NoteFooter from "@/app/components/notes/NoteFooter";
import UnsavedChangesDialog from "@/app/components/notes/UnsavedChangesDialog";
import { useUnsavedChangesGuard } from "@/app/hooks/useUnsavedChangesGuard";

function NewNoteClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId =
    searchParams.get("topicId") || searchParams.get("topic_id") || "";

  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialContent = useMemo(() => "<p></p>", []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Strike,
      Highlight,
      Link,
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

  const createNoteMutation = useMutation<Note, Error, CreateNotePayload>({
    mutationFn: (payload) => notesService.create(payload),
  });

  const createNote = useCallback(async (redirectToCreated = true) => {
    if (!editor || createNoteMutation.isPending) return;
    if (!topicId) {
      setError("Missing topic id");
      return false;
    }

    const titleTrim = title.trim();
    const hasContent = editor.getText().trim().length > 0;
    if (!titleTrim && !hasContent) return true;

    setError(null);

    try {
      const payload: CreateNotePayload = {
        topic_id: topicId,
        title: titleTrim || "Untitled",
        content: editor.getHTML(),
      };
      const created = await createNoteMutation.mutateAsync(payload);
      setIsDirty(false);
      if (redirectToCreated) {
        router.replace(`/notes/${created.id}`);
      }
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create note";
      setError(message);
      return false;
    }
  }, [createNoteMutation, editor, router, title, topicId]);

  const unsavedChangesGuard = useUnsavedChangesGuard({
    enabled: isDirty,
    onSave: async () => createNote(false),
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setIsDirty(true);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  const wordCount =
    editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0;
  const charCount = editor?.getText().length || 0;

  const statusLabel = createNoteMutation.isPending
    ? "Saving..."
    : isDirty
      ? "Unsaved"
      : "Draft";
  const saveLabel = createNoteMutation.isPending ? "Saving..." : "Save";
  const saveDisabled =
    createNoteMutation.isPending || !isDirty || !topicId;

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      setIsDirty(true);
    },
    [],
  );

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <NoteHeader />

      {/* EDITOR CORE */}
      <div className="flex-1 overflow-y-auto px-8 pt-12 pb-20">
        <div className="max-w-3xl mx-auto">
          <NewNoteTitleSection
            title={title}
            onTitleChange={handleTitleChange}
            topicId={topicId}
            wordCount={wordCount}
            statusLabel={statusLabel}
            onSave={() => void createNote()}
            saveDisabled={saveDisabled}
            saveLabel={saveLabel}
          />

          {/* TOOLBAR */}
          <EditorToolbar editor={editor} />

          {/* CANVAS */}
          <div className="mt-8">
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <NoteFooter wordCount={wordCount} charCount={charCount} />

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

export default function NewNoteClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-slate-500">
          Loading...
        </div>
      }
    >
      <NewNoteClientContent />
    </Suspense>
  );
}
