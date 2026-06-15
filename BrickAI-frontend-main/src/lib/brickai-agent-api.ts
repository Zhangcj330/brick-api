"use client";

export type RunStatus = "queued" | "running" | "completed" | "failed";

export interface Session {
  session_id: string;
  title: string;
  head_interaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InteractionUser {
  content: string;
  created_at: string;
}

export interface InteractionAssistant {
  content: string;
  created_at: string;
}

export interface Interaction {
  interaction_id: string;
  session_id: string;
  parent_interaction_id: string | null;
  user: InteractionUser;
  assistant: InteractionAssistant | null;
  created_at: string;
  updated_at: string;
}

export interface SessionPathResponse {
  session: Session;
  interactions: Interaction[];
}

export interface InteractionCreateResponse {
  interaction_id: string;
  status: RunStatus;
}

export interface DataPoint {
  label: string;
  value: string;
}

export interface StructuredCard {
  verdict: string;
  body?: string;
  dataPoints?: DataPoint[];
  concerns?: string[];
  nextSteps?: string[];
  milestoneType?: "neutral" | "positive" | "caution" | "blocking";
  milestoneCategory?: "property" | "suburb" | "budget" | "risk" | "grants" | "custom";
  milestoneData?: Record<string, unknown>;
  suggestModule?: string;
}

export interface InteractionResultResponse {
  interaction_id: string;
  status: RunStatus;
  ready: boolean;
  final_response: string | null;
  structured_card: StructuredCard | null;
  error: string | null;
}

export function extractFallbackVerdict(text: string): string {
  if (!text) return "";
  const match = text.match(/^([^.!?]{10,150}[.!?])/);
  return match ? match[1].trim() : text.slice(0, 150).trim();
}

const DEFAULT_API_BASE = "http://localhost:8000/api/v1";

function getApiBase() {
  const configuredBase = process.env.NEXT_PUBLIC_BRICKAI_AGENT_API_BASE?.trim();
  const apiBase = configuredBase && configuredBase.length > 0
    ? configuredBase
    : DEFAULT_API_BASE;

  return apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBase()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? String(payload.detail)
        : `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return payload as T;
}

export async function createSession(title: string): Promise<Session> {
  return apiFetch<Session>("/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function getSessionPath(sessionId: string): Promise<SessionPathResponse> {
  return apiFetch<SessionPathResponse>(`/sessions/${sessionId}`);
}

export async function createInteraction(
  sessionId: string,
  content: string,
): Promise<InteractionCreateResponse> {
  return apiFetch<InteractionCreateResponse>(`/sessions/${sessionId}/interactions`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function waitForInteractionResult(
  interactionId: string,
  {
    timeoutMs = 60000,
    intervalMs = 1200,
  }: {
    timeoutMs?: number;
    intervalMs?: number;
  } = {},
): Promise<InteractionResultResponse> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await apiFetch<InteractionResultResponse>(
      `/interactions/${interactionId}/result`,
    );

    if (result.status === "failed") {
      throw new Error(result.error ?? "Interaction failed");
    }

    result.structured_card ??= null;

    if (result.ready) {
      if (result.final_response) {
        try {
          const parsed = JSON.parse(result.final_response) as {
            text?: string;
            structured_card?: StructuredCard;
          };
          if (parsed.structured_card) {
            result.structured_card = parsed.structured_card;
            result.final_response = parsed.text || result.final_response;
          }
        } catch {
          // Not JSON - plain text response, structured_card stays null
        }
      }

      if (!result.structured_card && result.final_response) {
        result.structured_card = {
          verdict: extractFallbackVerdict(result.final_response),
        };
      }

      return result;
    }

    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }

  throw new Error("Brick AI timed out while waiting for a response");
}
