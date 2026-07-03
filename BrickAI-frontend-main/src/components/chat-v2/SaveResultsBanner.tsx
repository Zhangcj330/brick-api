"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { getSupabaseBrowserClient } from "@/src/lib/supabase";

interface SaveResultsBannerProps {
  visible: boolean;
}

export function SaveResultsBanner({ visible }: SaveResultsBannerProps) {
  const router = useRouter();
  const { isConfigured } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible) return null;

  const handleGoogleSignUp = async () => {
    if (!isConfigured) {
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
      if (error) router.push("/auth");
    } catch {
      router.push("/auth");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        margin: "var(--space-2) var(--space-5) var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--fog)",
        border: "1px solid var(--chalk)",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--eucalyptus)",
          }}
        >
          Want to save these insights?
        </div>
        <div
          style={{
            marginTop: 2,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--slate)",
          }}
        >
          Create a free account to keep your results.
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => { void handleGoogleSignUp(); }}
          disabled={isSubmitting}
          style={{
            border: "1px solid var(--chalk)",
            background: "var(--paper)",
            borderRadius: "var(--radius-xs)",
            padding: "7px var(--space-3)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 16,
              height: 16,
              borderRadius: "999px",
              border: "1px solid var(--chalk)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            G
          </span>
          Sign up with Google
        </button>
        <button
          type="button"
          onClick={() => router.push("/auth")}
          style={{
            border: "1px solid var(--ink)",
            background: "var(--ink)",
            borderRadius: "var(--radius-xs)",
            padding: "7px var(--space-3)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--paper)",
            cursor: "pointer",
          }}
        >
          Create free account
        </button>
      </div>
    </div>
  );
}
