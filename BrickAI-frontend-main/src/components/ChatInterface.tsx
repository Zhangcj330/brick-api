"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { Mic, Plus, Send, Sparkles } from "lucide-react";
import { AppNavigator } from "./AppNavigator";
import { ChatSuggestions } from "./ChatSuggestions";
import {
  createInteraction,
  createSession,
  getSessionPath,
  type Interaction,
  waitForInteractionResult,
} from "@/src/lib/brickai-agent-api";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type MessageKind = "text" | "loading" | "error";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  kind: MessageKind;
  title?: string;
  actions?: string[];
}

interface ChatInterfaceProps {
  initialMessage?: string;
}

function LandingChatComposer({
  inputMessage,
  disabled,
  onInputChange,
  onSubmit,
}: {
  inputMessage: string;
  disabled: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [inputMessage]);

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="space-y-0"
      >
        <div className="rounded-[26px] border border-[#d9d9d9] bg-white/95 px-4 py-2 shadow-[0_14px_40px_-26px_rgba(22,2,17,0.22)] backdrop-blur-xl">
          <input ref={fileInputRef} type="file" className="hidden" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#160211] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
              aria-label="Upload file"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
            <div className="flex min-w-0 flex-1 items-center self-center">
              <textarea
                ref={textareaRef}
                id="chat-input"
                value={inputMessage}
                disabled={disabled}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (inputMessage.trim() && !disabled) {
                      onSubmit();
                    }
                  }
                }}
                placeholder="Ask about a suburb, report, contract, or what to verify next"
                rows={1}
                className="max-h-[120px] min-h-[24px] w-full resize-none bg-transparent py-0 text-[15px] leading-6 text-[#160211] placeholder:text-[#8d8d8d] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#160211] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                aria-label="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!inputMessage.trim() || disabled}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#160211] text-white transition hover:bg-black disabled:bg-gray-300"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
      <p className="mt-2 text-center text-xs text-[#7b7b7b]">
        Brick AI can summarize and guide, but still needs real context for reports and contracts.
      </p>
    </div>
  );
}

const CHAT_SESSION_STORAGE_KEY = "brickai-chat-session-id";

function buildAssistantTitle(kind: MessageKind) {
  if (kind === "loading") return "Waiting for Brick AI";
  if (kind === "error") return "Connection issue";
  return "Brick AI";
}

function buildAssistantErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Gemini is not configured")) {
      return "The backend is reachable, but generation is not enabled yet. Set the Gemini API key in `brickai-agent-api-design/backend/.env` and try again.";
    }

    return error.message;
  }

  return "Brick AI could not complete the request.";
}

function mapInteractionsToMessages(interactions: Interaction[]): Message[] {
  return interactions.flatMap((interaction) => {
    const mapped: Message[] = [
      {
        id: `${interaction.interaction_id}-user`,
        role: "user",
        kind: "text",
        content: interaction.user.content,
        timestamp: interaction.user.created_at,
      },
    ];

    if (interaction.assistant?.content) {
      mapped.push({
        id: interaction.interaction_id,
        role: "assistant",
        kind: "text",
        content: interaction.assistant.content,
        timestamp: interaction.assistant.created_at,
        title: "Brick AI",
      });
    }

    return mapped;
  });
}

export function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [composerHeight, setComposerHeight] = useState(220);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerShellRef = useRef<HTMLDivElement>(null);
  const hasBootstrappedInitialMessage = useRef(false);
  const previousComposerHeightRef = useRef(220);
  const shouldAutoScrollRef = useRef(true);
  const isEmptyState = messages.length === 0;
  const hasDraftMessage = inputMessage.trim().length > 0;
  const showSuggestions = !hasDraftMessage && (isEmptyState || isAtBottom);
  const composerOffset = composerHeight + (showSuggestions ? 24 : 16);

  const syncBottomState = () => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return true;

    const distanceFromBottom =
      scrollContainer.scrollHeight -
      scrollContainer.clientHeight -
      scrollContainer.scrollTop;
    const atBottom = distanceFromBottom <= 4;

    setIsAtBottom(atBottom);
    shouldAutoScrollRef.current = atBottom;

    return atBottom;
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      syncBottomState();
    };

    syncBottomState();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [messages.length]);

  useEffect(() => {
    const composerShell = composerShellRef.current;
    if (!composerShell) return;

    const updateComposerHeight = () => {
      setComposerHeight(composerShell.getBoundingClientRect().height);
    };

    updateComposerHeight();

    const observer = new ResizeObserver(() => {
      updateComposerHeight();
    });

    observer.observe(composerShell);

    return () => observer.disconnect();
  }, [messages.length, inputMessage, isAtBottom]);

  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    const previousComposerHeight = previousComposerHeightRef.current;
    const composerHeightDelta = composerHeight - previousComposerHeight;

    if (scrollContainer && messages.length > 0 && showSuggestions && composerHeightDelta > 0) {
      scrollContainer.scrollTop += composerHeightDelta;
    }

    previousComposerHeightRef.current = composerHeight;
  }, [composerHeight, messages.length, showSuggestions]);

  useLayoutEffect(() => {
    if (!shouldAutoScrollRef.current) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    requestAnimationFrame(() => {
      const targetTop = Math.max(
        0,
        scrollContainer.scrollHeight - scrollContainer.clientHeight,
      );

      scrollContainer.scrollTop = targetTop;

      requestAnimationFrame(() => {
        scrollContainer.scrollTop = targetTop;
      });
      syncBottomState();
    });
  }, [messages.length]);

  useEffect(() => {
    let isActive = true;

    const storedSessionId = window.sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY);
    if (!storedSessionId) {
      setHasHydratedSession(true);
      return () => {
        isActive = false;
      };
    }

    getSessionPath(storedSessionId)
      .then((response) => {
        if (!isActive) return;
        setSessionId(response.session.session_id);
        setMessages(mapInteractionsToMessages(response.interactions));
      })
      .catch(() => {
        window.sessionStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
      })
      .finally(() => {
        if (isActive) {
          setHasHydratedSession(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedSession || !initialMessage || hasBootstrappedInitialMessage.current) {
      return;
    }

    hasBootstrappedInitialMessage.current = true;
    void handleSendMessage(initialMessage);
  }, [hasHydratedSession, initialMessage]);

  const handleSendMessage = async (text?: string) => {
    const messageText = (text ?? inputMessage).trim();
    if (!messageText || isSending) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      kind: "text",
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    const pendingMessageId = `${Date.now()}-assistant-pending`;
    const pendingAssistantMessage: Message = {
      id: pendingMessageId,
      role: "assistant",
      kind: "loading",
      title: "Waiting for Brick AI",
      content: "Thinking through your request...",
      timestamp: new Date().toISOString(),
    };

    shouldAutoScrollRef.current = true;
    setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
    setInputMessage("");
    setIsSending(true);

    try {
      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const session = await createSession("General chat");
        activeSessionId = session.session_id;
        setSessionId(activeSessionId);
        window.sessionStorage.setItem(CHAT_SESSION_STORAGE_KEY, activeSessionId);
      }

      const interaction = await createInteraction(activeSessionId, messageText);
      const result = await waitForInteractionResult(interaction.interaction_id);
      const assistantMessage: Message = {
        id: interaction.interaction_id,
        role: "assistant",
        kind: "text",
        title: "Brick AI",
        content: result.final_response ?? "Brick AI returned an empty response.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingMessageId ? assistantMessage : message,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingMessageId
            ? {
                ...message,
                kind: "error",
                title: buildAssistantTitle("error"),
                content: buildAssistantErrorMessage(error),
              }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`${dmSans.className} h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-emerald-50 text-[#160211]`}
    >
      <div className="mx-auto flex h-full w-full flex-col overflow-hidden">
        <div className="px-4 py-5 md:px-7">
          <AppNavigator />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-5 md:px-7 md:pb-7">
          <div className="pointer-events-none absolute bottom-10 left-1/2 h-[414px] w-[414px] -translate-x-[65%] rounded-full bg-[#b9b9b9]/55 blur-[250px]" />
          <div className="pointer-events-none absolute bottom-28 left-1/2 h-[280px] w-[280px] translate-x-[28%] rounded-full bg-[#aaaaaa]/50 blur-[150px]" />

          {isEmptyState ? (
            <div
              className="relative flex min-h-0 flex-1 flex-col items-center justify-center transition-[padding-bottom] duration-200 ease-out"
              style={{ paddingBottom: `${composerOffset}px` }}
            >
              <div className="flex w-full max-w-[460px] flex-col items-center gap-5 px-2 text-center">
                <Image
                  src="/brickAI_logo_mark_transparent.png"
                  alt="Brick AI mark"
                  width={72}
                  height={76}
                  className="h-[75.66px] w-auto"
                />
                <h1 className="text-2xl font-normal leading-[31px] text-[#160211]/70">
                  Help Australians find the right home
                </h1>
              </div>
            </div>
          ) : (
            <div
              className="relative flex min-h-0 flex-1 flex-col transition-[padding-bottom] duration-200 ease-out"
              style={{ paddingBottom: `${composerOffset}px` }}
            >
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto pr-2 md:pr-3"
              >
                <div className="mx-auto flex w-full max-w-3xl flex-col">
                  <div className="mb-6 inline-flex items-center self-center rounded-full border border-gray-200 bg-white/60 px-4 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-600 backdrop-blur-sm">
                    Australian Property Intelligence
                  </div>
                  <div className="flex flex-col gap-4 px-2 py-2 md:px-0">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "user" ? (
                          <div className="max-w-[80%] rounded-2xl border border-gray-900 bg-gray-900 px-4 py-3 text-sm leading-6 text-white sm:text-base">
                            {message.content}
                          </div>
                        ) : (
                          <div
                            className={`max-w-[84%] rounded-[24px] border px-5 py-4 text-[#160211] shadow-[0_14px_36px_-30px_rgba(22,2,17,0.18)] ${
                              message.kind === "error"
                                ? "border-red-200 bg-red-50/90"
                                : "border-gray-200 bg-white/92"
                            }`}
                          >
                            <div
                              className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] ${
                                message.kind === "error"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Sparkles className="h-3 w-3" />
                              {message.title ?? buildAssistantTitle(message.kind)}
                            </div>
                            <p
                              className={`text-sm leading-6 sm:text-base ${
                                message.kind === "loading" ? "animate-pulse text-[#160211]/60" : "text-[#160211]/80"
                              }`}
                            >
                              {message.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 md:px-6 md:pb-6">
        <div
          ref={composerShellRef}
          className="pointer-events-auto w-full max-w-3xl"
        >
          <ChatSuggestions
            isOpen={showSuggestions && !isSending}
            onSuggestionClick={(value) => {
              void handleSendMessage(value);
            }}
          />
          <LandingChatComposer
            inputMessage={inputMessage}
            disabled={isSending}
            onInputChange={setInputMessage}
            onSubmit={() => {
              void handleSendMessage();
            }}
          />
        </div>
      </div>
    </div>
  );
}
