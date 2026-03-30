import TopicDetailClient from "./TopicDetailClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TopicDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TopicDetailClient topicId={id} />;
}
