"use client";

import { cloneElement, isValidElement, type ReactNode, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { LoginPromptBanner } from "./LoginPromptBanner";

interface AuthGateProps {
  children: ReactNode;
  inputBar: ReactNode;
  chipsRow: ReactNode;
  onSendMessage: (msg: string) => void;
  isAuthenticated: boolean;
  messageCount: number;
  showLoginPrompt: boolean;
  onLoginPromptDismiss?: () => void;
}

export function AuthGate({
  children,
  inputBar,
  chipsRow,
  onSendMessage,
  isAuthenticated,
  messageCount,
  showLoginPrompt,
  onLoginPromptDismiss,
}: AuthGateProps) {
  const router = useRouter();

  const gatedInputBar = isValidElement<{ onSend?: (msg: string) => void }>(inputBar)
    ? cloneElement(inputBar as ReactElement<{ onSend?: (msg: string) => void }>, {
        onSend: onSendMessage,
      })
    : inputBar;

  return (
    <>
      {children}
      {showLoginPrompt && !isAuthenticated ? (
        <LoginPromptBanner visible={true} onDismiss={onLoginPromptDismiss} />
      ) : (
        chipsRow
      )}
      {(isAuthenticated || messageCount < 3) && gatedInputBar}
      {!isAuthenticated && messageCount >= 3 && !showLoginPrompt ? (
        <div
          style={{
            padding: "12px 20px",
            textAlign: "center",
            fontSize: 13,
            color: "var(--slate)",
            fontFamily: "var(--font-body)",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/auth")}
            style={{
              color: "var(--eucalyptus)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
              fontFamily: "var(--font-body)",
            }}
          >
            Sign in to continue
          </button>
        </div>
      ) : null}
    </>
  );
}
