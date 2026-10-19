import { useCallback, useEffect, useState } from "react";
import { env } from "../utils/env";
import { fetchWithAuth } from "../utils/fetchAuth";

const BASE_URL = env.VITE_API_BASE_URL;

/** Derived on the backend from starts_at/ends_at, so past sessions never show as upcoming. */
export type SessionStatus = "upcoming" | "live" | "completed" | "cancelled";

export interface SessionParticipant {
  id: number;
  name: string;
  avatar_url: string | null;
  is_host: boolean;
}

export interface StudySession {
  id: number;
  host_id: number;
  /** True when the viewer created the session (only the host can reschedule/cancel). */
  is_host: boolean;
  title: string;
  skill_tag: string | null;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  status: SessionStatus;
  room_id: string;
  created_at: string;
  /** Everyone in the session except the viewer (host included). */
  participants: SessionParticipant[];
}

/** Max people per session incl. host — mirrors MAX_PARTICIPANTS on the backend. */
export const MAX_PARTICIPANTS = 8;

/** "Asha", "Asha & Ravi", "Asha, Ravi +2". */
export function participantLabel(s: StudySession) {
  const names = s.participants.map((p) => p.name.split(" ")[0]);
  if (names.length <= 2) return names.join(" & ") || "Just you";
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

export interface CreateSessionInput {
  participant_ids: number[];
  title: string;
  skill_tag?: string;
  notes?: string;
  starts_at: string;
  ends_at: string;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(url, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed.");
  return json.data as T;
}

/** Re-derive status client-side so a session flips to live/completed without a refetch. */
export function liveStatus(s: StudySession, now = Date.now()): SessionStatus {
  if (s.status === "cancelled") return "cancelled";
  if (now < new Date(s.starts_at).getTime()) return "upcoming";
  if (now <= new Date(s.ends_at).getTime()) return "live";
  return "completed";
}

/** Ticks every 30s so countdowns and statuses stay current. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useSessions(userId: number | null) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      setSessions(await request<StudySession[]>(`${BASE_URL}/sessions/user/${userId}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const upsert = (s: StudySession) =>
    setSessions((prev) =>
      [...prev.filter((p) => p.id !== s.id), s].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    );

  const createSession = useCallback(
    async (input: CreateSessionInput) => {
      const s = await request<StudySession>(`${BASE_URL}/sessions/create?user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(input),
      });
      upsert(s);
      return s;
    },
    [userId],
  );

  const rescheduleSession = useCallback(
    async (id: number, starts_at: string, ends_at: string) => {
      const s = await request<StudySession>(
        `${BASE_URL}/sessions/${id}/reschedule?user_id=${userId}`,
        { method: "POST", body: JSON.stringify({ starts_at, ends_at }) },
      );
      upsert(s);
      return s;
    },
    [userId],
  );

  const cancelSession = useCallback(
    async (id: number) => {
      const s = await request<StudySession>(`${BASE_URL}/sessions/${id}/cancel?user_id=${userId}`, {
        method: "POST",
      });
      upsert(s);
      return s;
    },
    [userId],
  );

  const addParticipants = useCallback(
    async (id: number, user_ids: number[]) => {
      const s = await request<StudySession>(
        `${BASE_URL}/sessions/${id}/participants?user_id=${userId}`,
        { method: "POST", body: JSON.stringify({ user_ids }) },
      );
      upsert(s);
      return s;
    },
    [userId],
  );

  /** Host removes someone, or pass your own id to leave. */
  const removeParticipant = useCallback(
    async (id: number, participantId: number) => {
      const s = await request<StudySession | null>(
        `${BASE_URL}/sessions/${id}/participants/${participantId}/remove?user_id=${userId}`,
        { method: "POST" },
      );
      if (s) upsert(s);
      else setSessions((prev) => prev.filter((p) => p.id !== id));
      return s;
    },
    [userId],
  );

  return {
    sessions,
    loading,
    error,
    refresh,
    createSession,
    rescheduleSession,
    cancelSession,
    addParticipants,
    removeParticipant,
  };
}

export function fetchSession(id: number, userId: number) {
  return request<StudySession>(`${BASE_URL}/sessions/${id}?user_id=${userId}`);
}
