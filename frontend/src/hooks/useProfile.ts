import { useCallback, useState } from "react";
import { env } from "../utils/env";
import { fetchWithAuth } from "../utils/fetchAuth";
import type { FullUserProfile, RawProfile } from "../types/profile";

const BASE_URL = env.VITE_API_BASE_URL;

export function useProfile(userId: number | null) {
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth(`${BASE_URL}/profile/full/${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load profile.");
      setProfile(json.data as FullUserProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // The flat/raw shape — used only to prefill the edit form and to preserve
  // fields the form doesn't edit (work history, featured posts, etc.).
  const fetchRaw = useCallback(async (): Promise<RawProfile | null> => {
    if (!userId) return null;
    const res = await fetchWithAuth(`${BASE_URL}/profile/${userId}`);
    if (res.status === 404) return null; // no profile yet — first-time edit creates one
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to load profile for editing.");
    return json.data as RawProfile;
  }, [userId]);

  const save = useCallback(
    async (payload: RawProfile) => {
      if (!userId) throw new Error("Not logged in.");
      const res = await fetchWithAuth(`${BASE_URL}/profile/onboard?user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save profile.");
      await refresh();
      return json.data;
    },
    [refresh, userId],
  );

  return { profile, loading, error, refresh, fetchRaw, save };
}
