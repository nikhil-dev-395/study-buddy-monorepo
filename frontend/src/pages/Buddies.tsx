import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserResult from "../components/search/User";
import { useAuth } from "../hooks/useAuth";
import { useBuddies, useConnectionActions } from "../hooks/useConnections";

type Tab = "connected" | "sent" | "incoming";

export default function BuddiesPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("connected");
  const { connected, sent, incoming, loading, error, refresh } = useBuddies(userId);
  const { acceptRequest, rejectRequest, cancelRequest, busyId } =
    useConnectionActions(userId);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "connected", label: "My Buddies", count: connected.length },
    { key: "sent", label: "Sent Requests", count: sent.length },
    { key: "incoming", label: "Incoming", count: incoming.length },
  ];

  return (
    <div className="mt-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-1.5 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
              tab === t.key
                ? "bg-emerald-500 text-black shadow-md"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="text-[10px] font-mono opacity-80">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-xs text-zinc-500">Loading...</p>}
      {error && <p className="text-center text-xs text-red-400">{error}</p>}

      {!loading && tab === "connected" && (
        <div className="flex flex-col gap-4">
          {connected.length === 0 && (
            <p className="text-center text-xs text-zinc-500">
              No study buddies yet — find one in Search.
            </p>
          )}
          {connected.map((buddy) => (
            <UserResult
              key={buddy.id}
              userId={buddy.id}
              name={buddy.name}
              avatarUrl={buddy.avatarUrl ?? ""}
              location={buddy.location ?? "Remote"}
              institution={buddy.academicDetails?.institution ?? undefined}
              major={buddy.academicDetails?.major ?? undefined}
              year={buddy.academicDetails?.year ?? undefined}
              subjects={buddy.studyPreferences?.subjects}
              mode={buddy.studyPreferences?.mode}
              actionLabel="Message"
              onAction={() => navigate("/chat")}
            />
          ))}
        </div>
      )}

      {!loading && tab === "sent" && (
        <div className="flex flex-col gap-4">
          {sent.length === 0 && (
            <p className="text-center text-xs text-zinc-500">
              You haven't sent any requests yet.
            </p>
          )}
          {sent.map((buddy) => (
            <UserResult
              key={buddy.id}
              userId={buddy.id}
              name={buddy.name}
              avatarUrl={buddy.avatarUrl ?? ""}
              location={buddy.location ?? "Remote"}
              institution={buddy.academicDetails?.institution ?? undefined}
              major={buddy.academicDetails?.major ?? undefined}
              year={buddy.academicDetails?.year ?? undefined}
              subjects={buddy.studyPreferences?.subjects}
              mode={buddy.studyPreferences?.mode}
              actionLabel={buddy.isRequestAccepted ? "Accepted" : "Cancel"}
              actionDisabled={buddy.isRequestAccepted}
              actionLoading={busyId === buddy.connectionRequestId}
              onAction={async () => {
                await cancelRequest(buddy.connectionRequestId);
                void refresh();
              }}
            />
          ))}
        </div>
      )}

      {!loading && tab === "incoming" && (
        <div className="flex flex-col gap-3">
          {incoming.length === 0 && (
            <p className="text-center text-xs text-zinc-500">
              No incoming requests right now.
            </p>
          )}
          {incoming.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-zinc-100 font-semibold">
                  User #{req.sender_id}
                </p>
                {req.message && (
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{req.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={busyId === req.id}
                  onClick={async () => {
                    await rejectRequest(req.id);
                    void refresh();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition active:scale-95 disabled:opacity-40"
                >
                  Reject
                </button>
                <button
                  disabled={busyId === req.id}
                  onClick={async () => {
                    await acceptRequest(req.id);
                    void refresh();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition active:scale-95 disabled:opacity-40"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
