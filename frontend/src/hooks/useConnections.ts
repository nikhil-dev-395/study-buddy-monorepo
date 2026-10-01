import { useCallback, useState } from "react";
import { env } from "../utils/env";
import { fetchWithAuth } from "../utils/fetchAuth";
import type { BuddyCard, ConnectionRequestRecord } from "../types/buddy";

const BASE_URL = env.VITE_API_BASE_URL;

async function postJson(url: string, body?: unknown) {
  const res = await fetchWithAuth(url, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed.");
  return json.data;
}

/** Send/accept/reject/cancel actions, shared by the Search and Buddies pages. */
export function useConnectionActions(userId: number | null) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (busyKey: number, action: () => Promise<unknown>) => {
      try {
        setBusyId(busyKey);
        setError(null);
        return await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        throw err;
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const sendRequest = useCallback(
    (receiverId: number) => {
      if (!userId) return Promise.reject(new Error("Not logged in."));
      return run(receiverId, () =>
        postJson(`${BASE_URL}/connections/send?sender_id=${userId}`, {
          receiver_id: receiverId,
        }),
      ) as Promise<ConnectionRequestRecord>;
    },
    [run, userId],
  );

  const acceptRequest = useCallback(
    (requestId: number) => {
      if (!userId) return Promise.reject(new Error("Not logged in."));
      return run(requestId, () =>
        postJson(`${BASE_URL}/connections/accept?user_id=${userId}`, {
          request_id: requestId,
        }),
      ) as Promise<ConnectionRequestRecord>;
    },
    [run, userId],
  );

  const rejectRequest = useCallback(
    (requestId: number) => {
      if (!userId) return Promise.reject(new Error("Not logged in."));
      return run(requestId, () =>
        postJson(`${BASE_URL}/connections/reject?user_id=${userId}`, {
          request_id: requestId,
        }),
      ) as Promise<ConnectionRequestRecord>;
    },
    [run, userId],
  );

  const cancelRequest = useCallback(
    (requestId: number) => {
      if (!userId) return Promise.reject(new Error("Not logged in."));
      return run(requestId, () =>
        postJson(`${BASE_URL}/connections/cancel?sender_id=${userId}`, {
          request_id: requestId,
        }),
      ) as Promise<ConnectionRequestRecord>;
    },
    [run, userId],
  );

  return { sendRequest, acceptRequest, rejectRequest, cancelRequest, busyId, error };
}

/** Buddy lists for the Buddies page: connected, sent, and incoming requests. */
export function useBuddies(userId: number | null) {
  const [connected, setConnected] = useState<BuddyCard[]>([]);
  const [sent, setSent] = useState<BuddyCard[]>([]);
  const [incoming, setIncoming] = useState<ConnectionRequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const [connectedRes, sentRes, incomingRes] = await Promise.all([
        fetchWithAuth(`${BASE_URL}/connections/my-buddies/connected/${userId}`),
        fetchWithAuth(`${BASE_URL}/connections/my-buddies/sent/${userId}`),
        fetchWithAuth(`${BASE_URL}/connections/requested/${userId}`, { method: "POST" }),
      ]);

      const [connectedJson, sentJson, incomingJson] = await Promise.all([
        connectedRes.json(),
        sentRes.json(),
        incomingRes.json(),
      ]);

      if (!connectedRes.ok) throw new Error(connectedJson.message || "Failed to load buddies.");
      if (!sentRes.ok) throw new Error(sentJson.message || "Failed to load sent requests.");
      if (!incomingRes.ok) throw new Error(incomingJson.message || "Failed to load requests.");

      setConnected(connectedJson.data as BuddyCard[]);
      setSent(sentJson.data as BuddyCard[]);
      setIncoming(incomingJson.data as ConnectionRequestRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load buddies.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { connected, sent, incoming, loading, error, refresh, setIncoming, setSent };
}
