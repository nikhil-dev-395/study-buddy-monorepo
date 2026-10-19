import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiClock, FiMessageCircle, FiX } from "react-icons/fi";
import UserResult from "../components/search/User";
import { useAuth } from "../hooks/useAuth";
import { useBuddies, useConnectionActions } from "../hooks/useConnections";
import { formatRelative } from "../utils/time";

type Tab = "connected" | "sent" | "incoming";

function SenderAvatar({ name, src }: { name: string; src?: string | null }) {
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setBroken(true)}
        className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-emerald-400 font-semibold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

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

  // Accepted requests already appear under "My Buddies"; this tab is only what's still waiting.
  const pendingSent = sent.filter((b) => !b.isRequestAccepted);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "connected", label: "My Buddies", count: connected.length },
    { key: "sent", label: "Requested", count: pendingSent.length },
    { key: "incoming", label: "Incoming", count: incoming.length },
  ];

  return (
    <div className="mt-6 max-w-md mx-auto px-4">
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
              <span
                className={`min-w-4 h-4 px-1 rounded-full text-[10px] font-mono flex items-center justify-center ${
                  tab === t.key
                    ? "bg-black/20"
                    : t.key === "incoming"
                      ? "bg-emerald-500 text-black"
                      : "bg-zinc-800"
                }`}
              >
                {t.count}
              </span>
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
              statusBadge={
                <span className="shrink-0 flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <FiCheck className="w-3 h-3" /> Buddy
                </span>
              }
              actionLabel="Message"
              onAction={() => navigate(`/chat?peer=${buddy.id}`)}
            />
          ))}
        </div>
      )}

      {!loading && tab === "sent" && (
        <div className="flex flex-col gap-4">
          {pendingSent.length === 0 && (
            <p className="text-center text-xs text-zinc-500">
              No pending requests — everyone you asked has replied.
            </p>
          )}
          {pendingSent.map((buddy) => (
            <div key={buddy.id} className="opacity-90">
              <UserResult
                userId={buddy.id}
                name={buddy.name}
                avatarUrl={buddy.avatarUrl ?? ""}
                location={buddy.location ?? "Remote"}
                institution={buddy.academicDetails?.institution ?? undefined}
                major={buddy.academicDetails?.major ?? undefined}
                year={buddy.academicDetails?.year ?? undefined}
                subjects={buddy.studyPreferences?.subjects}
                mode={buddy.studyPreferences?.mode}
                isSearching={false}
                statusBadge={
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/25">
                    <FiClock className="w-3 h-3" /> Requested
                  </span>
                }
                actionLabel="Withdraw"
                actionLoading={busyId === buddy.connectionRequestId}
                onAction={async () => {
                  await cancelRequest(buddy.connectionRequestId);
                  void refresh();
                }}
              />
              <p className="text-[11px] text-zinc-500 text-center mt-1.5">
                Waiting for {buddy.name.split(" ")[0]} to accept — you can message once they do.
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "incoming" && (
        <div className="flex flex-col gap-3">
          {incoming.length === 0 && (
            <p className="text-center text-xs text-zinc-500">No incoming requests right now.</p>
          )}
          {incoming.map((req) => {
            const name = req.sender_name ?? `User #${req.sender_id}`;
            return (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-emerald-500/20 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(`/profile/${req.sender_id}`)}>
                    <SenderAvatar name={name} src={req.sender_avatar} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-100 font-semibold truncate">
                      {name}
                      <span className="ml-2 text-[10px] font-normal text-zinc-500">
                        {formatRelative(req.created_at)}
                      </span>
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {req.sender_headline || "wants to study with you"}
                    </p>
                  </div>
                </div>

                {req.message && (
                  <p className="text-xs text-zinc-300 bg-black/40 border border-zinc-800 rounded-xl p-2.5">
                    “{req.message}”
                  </p>
                )}

                {req.sender_subjects && req.sender_subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {req.sender_subjects.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-emerald-400 border border-emerald-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    disabled={busyId === req.id}
                    onClick={async () => {
                      await rejectRequest(req.id);
                      void refresh();
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition active:scale-95 disabled:opacity-40"
                  >
                    <FiX className="w-3.5 h-3.5" /> Decline
                  </button>
                  <button
                    disabled={busyId === req.id}
                    onClick={async () => {
                      await acceptRequest(req.id);
                      void refresh();
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition active:scale-95 disabled:opacity-40"
                  >
                    <FiMessageCircle className="w-3.5 h-3.5" /> Accept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
