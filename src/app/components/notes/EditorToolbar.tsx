"use client";

import type { ReactNode } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading, Quote } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
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
    children: ReactNode;
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
          editor.chain().focus().toggleBlockquote().run();
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
        Link
      </Button>
      <Button
        onClick={() => {
          const url = prompt("Image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
      >
        Img
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
