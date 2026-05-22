import { ChatRoutePage } from "@/src/components/routes/ChatRoutePage";

type ChatPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;

  return <ChatRoutePage initialMessage={params.message} />;
}
