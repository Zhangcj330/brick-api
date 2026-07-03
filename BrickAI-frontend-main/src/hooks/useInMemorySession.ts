"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  JourneyMilestone,
  MilestoneCategory,
  MilestoneType,
} from "@/src/lib/database.types";

const GUEST_TURN_COUNT_KEY = "brick_guest_turn_count";

function tempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface InMemoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface UseInMemorySessionReturn {
  messages: InMemoryMessage[];
  milestones: JourneyMilestone[];
  addMessage: (role: "user" | "assistant", content: string) => void;
  addMilestone: (input: {
    type: MilestoneType;
    milestoneCategory: MilestoneCategory;
    title: string;
    data?: Record<string, unknown>;
  }) => void;
  messageCount: number;
  userTurnCount: number;
  clear: () => void;
}

export function useInMemorySession(): UseInMemorySessionReturn {
  const [messages, setMessages] = useState<InMemoryMessage[]>([]);
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
  const [userTurnCount, setUserTurnCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = sessionStorage.getItem(GUEST_TURN_COUNT_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  useEffect(() => {
    sessionStorage.setItem(GUEST_TURN_COUNT_KEY, String(userTurnCount));
  }, [userTurnCount]);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((current) => [
      ...current,
      {
        id: tempId(),
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (role === "user") {
      setUserTurnCount((n) => n + 1);
    }
  }, []);

  const addMilestone = useCallback(
    (input: {
      type: MilestoneType;
      milestoneCategory: MilestoneCategory;
      title: string;
      data?: Record<string, unknown>;
    }) => {
      setMilestones((current) => [
        ...current,
        {
          id: tempId(),
          property_session_id: "in-memory-session",
          type: input.type,
          milestone_category: input.milestoneCategory,
          title: input.title,
          data: input.data ?? {},
          created_at: new Date().toISOString(),
        },
      ]);
    },
    [],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setMilestones([]);
    setUserTurnCount(0);
    sessionStorage.removeItem(GUEST_TURN_COUNT_KEY);
  }, []);

  return {
    messages,
    milestones,
    addMessage,
    addMilestone,
    messageCount: messages.length,
    userTurnCount,
    clear,
  };
}
