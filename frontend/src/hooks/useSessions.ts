import { useCallback, useEffect, useState } from "react";
import { env } from "../utils/env";
import { fetchWithAuth } from "../utils/fetchAuth";

const BASE_URL = env.VITE_API_BASE_URL;

/** Derived on the backend from starts_at/ends_at, so past sessions never show as upcoming. */
export type SessionStatus = "upcoming" | "live" | "completed" | "cancelled";

export interface StudySession {
  id: number;
  host_id: number;
  buddy_id: number;
  title: string;
  skill_tag: string | null;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  status: SessionStatus;
  room_id: string;
  created_at: string;
  partner_id: number;
  partner_name: string;
  partner_avatar: string | null;
}

export interface CreateSessionInput {
  buddy_id: number;
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

  return { sessions, loading, error, refresh, createSession, rescheduleSession, cancelSession };
}

export function fetchSession(id: number, userId: number) {
  return request<StudySession>(`${BASE_URL}/sessions/${id}?user_id=${userId}`);
}
