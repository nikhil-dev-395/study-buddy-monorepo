import { useNavigate } from "react-router-dom";
import { FiCheck, FiClock, FiInbox } from "react-icons/fi";
import UserResult from "./User";
import type { BuddyCard } from "../../types/buddy";

type SearchResultProps = {
  query: string;
  results: BuddyCard[];
  loading: boolean;
  error: string | null;
  busyId: number | null;
  onConnect: (peer: BuddyCard) => void;
  onCancel: (peer: BuddyCard) => void;
  onAccept: (peer: BuddyCard) => void;
  onDecline: (peer: BuddyCard) => void;
};

const badge = "shrink-0 flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border";

export default function SearchResult({
  query,
  results,
  loading,
  error,
  busyId,
  onConnect,
  onCancel,
  onAccept,
  onDecline,
}: SearchResultProps) {
  const navigate = useNavigate();
  if (!query.trim()) {
    return (
      <p className="mt-10 text-center text-xs text-zinc-500">
        Search by subject, skill, or location to find a study buddy.
      </p>
    );
  }

  if (loading) {
    return <p className="mt-10 text-center text-xs text-zinc-500">Searching...</p>;
  }

  if (error) {
    return <p className="mt-10 text-center text-xs text-red-400">{error}</p>;
  }

  if (results.length === 0) {
    return (
      <p className="mt-10 text-center text-xs text-zinc-500">
        No study buddies found for "{query}".
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4 max-w-md mx-auto">
      {results.map((user) => {
        const state = user.connectionStatus ?? (user.isRequestAccepted ? "connected" : "none");
        const busy = busyId === user.id || busyId === user.connectionRequestId;

        const props =
          state === "connected"
            ? {
                statusBadge: (
                  <span className={`${badge} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
                    <FiCheck className="w-3 h-3" /> Buddy
                  </span>
                ),
                actionLabel: "Message",
                onAction: () => navigate(`/chat?peer=${user.id}`),
              }
            : state === "sent"
              ? {
                  statusBadge: (
                    <span className={`${badge} bg-amber-500/10 text-amber-400 border-amber-500/25`}>
                      <FiClock className="w-3 h-3" /> Requested
                    </span>
                  ),
                  actionLabel: "Cancel request",
                  onAction: () => onCancel(user),
                }
              : state === "received"
                ? {
                    statusBadge: (
                      <span className={`${badge} bg-sky-500/10 text-sky-400 border-sky-500/25`}>
                        <FiInbox className="w-3 h-3" /> Wants to connect
                      </span>
                    ),
                    secondaryActionLabel: "Decline",
                    onSecondaryAction: () => onDecline(user),
                    actionLabel: "Accept",
                    onAction: () => onAccept(user),
                  }
                : { actionLabel: "Connect", onAction: () => onConnect(user) };

        return (
          <UserResult
            key={user.id}
            userId={user.id}
            name={user.name}
            avatarUrl={user.avatarUrl ?? ""}
            location={user.location ?? "Remote"}
            institution={user.academicDetails?.institution ?? undefined}
            major={user.academicDetails?.major ?? undefined}
            year={user.academicDetails?.year ?? undefined}
            subjects={user.studyPreferences?.subjects}
            mode={user.studyPreferences?.mode}
            isSearching={user.status?.isSearching}
            actionLoading={busy}
            {...props}
          />
        );
      })}
    </div>
  );
}
