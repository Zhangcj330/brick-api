"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { getSupabaseBrowserClient } from "@/src/lib/supabase";

interface LoginPromptBannerProps {
  visible: boolean;
  onDismiss?: () => void;
}

export function LoginPromptBanner({ visible, onDismiss }: LoginPromptBannerProps) {
  const router = useRouter();
  const { isConfigured } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    if (!isConfigured) {
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
        },
      });

      if (error) {
        router.push("/auth");
      }
    } catch {
      router.push("/auth");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = () => {
    router.push("/auth");
  };

  return (
    <div
      style={{
        margin: "var(--space-3) var(--space-5)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--limestone)",
        border: "1px solid var(--chalk)",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-2)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            You've used your 3 free questions
          </div>
          <div
            style={{
              marginTop: 2,
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--slate)",
            }}
          >
            Sign in to keep going and save your insights.
          </div>
        </div>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              color: "var(--slate)",
              cursor: "pointer",
              fontSize: 16,
              padding: "2px 4px",
              lineHeight: 1,
            }}
            aria-label="Dismiss login prompt"
          >
            ×
          </button>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          flexWrap: "wrap",
          marginTop: "var(--space-1)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            void handleGoogleSignIn();
          }}
          disabled={isSubmitting}
          style={{
            border: "1px solid var(--chalk)",
            background: "var(--paper)",
            borderRadius: "var(--radius-xs)",
            padding: "8px var(--space-3)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 18,
              height: 18,
              borderRadius: "999px",
              border: "1px solid var(--chalk)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            G
          </span>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={handleEmailLogin}
          style={{
            border: "1px solid var(--ink)",
            background: "var(--ink)",
            borderRadius: "var(--radius-xs)",
            padding: "8px var(--space-3)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--paper)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          Continue with email
        </button>
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--slate)",
        }}
      >
        Your conversation is saved and ready when you sign in.
      </div>
    </div>
  );
}
