"use client";

import { useParams } from "next/navigation";
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
} from "lucide-react";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesService } from "@/app/services/notes.service";
import { Note, UpdateNotePayload } from "@/app/types/note.types";

export default function NoteEditorPage() {
  const params = useParams();
  const noteId = params.id as string;

  const isCreateMode = noteId === "new";

  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(isDirty);
  const isSavingRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const queryClient = useQueryClient();

  const noteQuery = useQuery<Note, Error>({
    queryKey: ["note", noteId],
    queryFn: () => notesService.getById(noteId),
    enabled: !isCreateMode && !!noteId,
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
    editor.commands.setContent(content, false);
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

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200">
        <div className="text-sm text-slate-600">
          Work / Projects /{" "}
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
                {!isCreateMode && <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
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
              <div className="mb-4 text-sm text-red-600">
                {errorMessage}
              </div>
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
              Last saved {lastSavedAt.toLocaleTimeString("en-US", {
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
    </div>
  );
}

function EditorToolbar({ editor }: { editor: any }) {
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
        active={editorState.bold}
      >
        <Bold size={18} />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editorState.italic}
      >
        <Italic size={18} />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editorState.underline}
      >
        <Underline size={18} />
      </Button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <Button
        onClick={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
        active={editorState.bulletList}
      >
        <List size={18} />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editorState.orderedList}
      >
        <ListOrdered size={18} />
      </Button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editorState.heading}
      >
        <Heading size={18} />
      </Button>

      <Button
        onClick={() => {
          console.log("before:", editor.isActive("blockquote"));
          editor.chain().focus().toggleBlockquote().run();
          console.log("after:", editor.isActive("blockquote"));
        }}
        active={editorState.blockquote}
      >
        <Quote size={18} />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editorState.strike}
      >
        S
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editorState.highlight}
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
