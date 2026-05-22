"use client";

import { ChatInterface } from "@/src/components/ChatInterface";

interface ChatRoutePageProps {
  initialMessage?: string;
}

export function ChatRoutePage({ initialMessage }: ChatRoutePageProps) {
  return <ChatInterface initialMessage={initialMessage} />;
}
