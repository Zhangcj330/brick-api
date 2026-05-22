"use client";

import { motion } from "motion/react";

const SUGGESTIONS = [
  "Summarize a suburb for me",
  "Which suburbs match my budget and commute?",
  "Help me understand a report or contract",
  "What should I verify next before going further?",
];

interface ChatSuggestionsProps {
  isOpen: boolean;
  onSuggestionClick: (prompt: string) => void;
}

export function ChatSuggestions({
  isOpen,
  onSuggestionClick,
}: ChatSuggestionsProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? "auto" : 0,
        marginBottom: isOpen ? 20 : 0,
      }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="origin-bottom overflow-hidden"
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : 12,
        }}
        transition={{
          duration: 0.18,
          delay: isOpen ? 0.12 : 0,
          ease: "easeOut",
        }}
      >
        <p className="mb-2 hidden text-[10px] uppercase tracking-[0.3em] text-gray-500 sm:block">
          Common buyer questions
        </p>
        <div className="flex max-w-3xl gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
          {SUGGESTIONS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSuggestionClick(prompt)}
              className="shrink-0 whitespace-nowrap rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-left text-[13px] leading-5 text-[#160211] shadow-[0_10px_30px_-28px_rgba(22,2,17,0.16)] backdrop-blur-sm transition hover:border-gray-300 hover:bg-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
