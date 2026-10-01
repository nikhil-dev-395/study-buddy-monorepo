import { useCallback, useEffect, useRef, useState } from "react";
import { env } from "../utils/env";
import { fetchWithAuth } from "../utils/fetchAuth";
import { isSupabaseConfigured, supabase } from "../utils/supabaseClient";

const BASE_URL = env.VITE_API_BASE_URL;

export interface ConversationPreview {
  peer_id: number;
  name: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Live delivery: Supabase Realtime once VITE_SUPABASE_URL/ANON_KEY are set,
// otherwise a short-interval poll — swap is automatic, no UI code changes.
const THREAD_POLL_MS = isSupabaseConfigured ? 15000 : 3000;
const CONVERSATIONS_POLL_MS = 8000;

export function useMessages(userId: number | null) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activePeerId, setActivePeerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastMessageIdRef = useRef(0);

  const refreshConversations = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingConversations(true);
      const res = await fetchWithAuth(`${BASE_URL}/messages/conversations/${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load conversations.");
      setConversations(json.data as ConversationPreview[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, [userId]);

  const loadThread = useCallback(
    async (peerId: number, { replace = false }: { replace?: boolean } = {}) => {
      if (!userId) return;
      try {
        if (replace) setLoadingThread(true);
        const afterId = replace ? 0 : lastMessageIdRef.current;
        const res = await fetchWithAuth(
          `${BASE_URL}/messages/thread/${userId}/${peerId}?after_id=${afterId}`,
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load messages.");

        const incoming = json.data as ChatMessage[];
        if (incoming.length === 0) return;

        setMessages((prev) => (replace ? incoming : [...prev, ...incoming]));
        lastMessageIdRef.current = incoming.reduce(
          (max, m) => Math.max(max, m.id),
          lastMessageIdRef.current,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages.");
      } finally {
        if (replace) setLoadingThread(false);
      }
    },
    [userId],
  );

  const selectConversation = useCallback(
    (peerId: number) => {
      lastMessageIdRef.current = 0;
      setMessages([]);
      setActivePeerId(peerId);
      void loadThread(peerId, { replace: true });

      if (userId) {
        void fetchWithAuth(`${BASE_URL}/messages/thread/${userId}/${peerId}/read`, {
          method: "POST",
        }).then(() => {
          setConversations((prev) =>
            prev.map((c) => (c.peer_id === peerId ? { ...c, unread_count: 0 } : c)),
          );
        });
      }
    },
    [loadThread, userId],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !activePeerId || !content.trim()) return;

      const res = await fetchWithAuth(`${BASE_URL}/messages/send?sender_id=${userId}`, {
        method: "POST",
        body: JSON.stringify({ receiver_id: activePeerId, content: content.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to send message.");
        return;
      }

      const sent = json.data as ChatMessage;
      setMessages((prev) => [...prev, sent]);
      lastMessageIdRef.current = Math.max(lastMessageIdRef.current, sent.id);
      void refreshConversations();
    },
    [activePeerId, refreshConversations, userId],
  );

  // Initial + background refresh of the conversation list.
  useEffect(() => {
    if (!userId) return;
    void refreshConversations();
    const interval = setInterval(() => void refreshConversations(), CONVERSATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, [refreshConversations, userId]);

  // Active thread: poll for new messages (fast path when Supabase isn't configured).
  useEffect(() => {
    if (!userId || !activePeerId) return;
    const interval = setInterval(() => void loadThread(activePeerId), THREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [activePeerId, loadThread, userId]);

  // Live path: Supabase Realtime push for the active thread, once configured.
  useEffect(() => {
    const client = supabase;
    if (!client || !userId || !activePeerId) return;

    const channel = client
      .channel(`messages-${userId}-${activePeerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as ChatMessage;
          const belongsToThread =
            (row.sender_id === userId && row.receiver_id === activePeerId) ||
            (row.sender_id === activePeerId && row.receiver_id === userId);
          if (!belongsToThread) {
            void refreshConversations();
            return;
          }
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row],
          );
          lastMessageIdRef.current = Math.max(lastMessageIdRef.current, row.id);
          void refreshConversations();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [activePeerId, refreshConversations, userId]);

  return {
    conversations,
    activePeerId,
    messages,
    loadingConversations,
    loadingThread,
    error,
    selectConversation,
    sendMessage,
    refreshConversations,
  };
}
