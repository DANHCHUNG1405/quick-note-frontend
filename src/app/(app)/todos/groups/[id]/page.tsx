import TodoGroupDetailClient from "./TodoGroupDetailClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TodoGroupDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TodoGroupDetailClient groupId={id} />;
}
