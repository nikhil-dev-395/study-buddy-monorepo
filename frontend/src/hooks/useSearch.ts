import { useCallback, useState } from "react";
import { env } from "../utils/env";
import { fetchWithAuth } from "../utils/fetchAuth";
import type { BuddyCard } from "../types/buddy";

const BASE_URL = env.VITE_API_BASE_URL;

export function useSearch(currentUserId: number | null) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BuddyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setResults([]);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ q });
        if (currentUserId) params.set("current_user_id", String(currentUserId));
        const res = await fetchWithAuth(`${BASE_URL}/search/peers?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Search failed.");
        setResults(json.data as BuddyCard[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId],
  );

  // Optimistically reflect a just-sent request without re-querying the backend.
  const markPending = useCallback((peerId: number, connectionRequestId: number) => {
    setResults((prev) =>
      prev.map((r) => (r.id === peerId ? { ...r, connectionRequestId } : r)),
    );
  }, []);

  return { query, results, loading, error, search, markPending };
}
