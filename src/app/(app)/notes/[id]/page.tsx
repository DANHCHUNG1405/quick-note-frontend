import NoteEditorClient from "./NoteEditorClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NoteEditorPage({ params }: PageProps) {
  const { id } = await params;
  return <NoteEditorClient noteId={id} />;
}
