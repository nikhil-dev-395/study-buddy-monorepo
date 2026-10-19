import { Link } from "react-router-dom";
import InputBar from "../components/search/InputBar";
import SearchResult from "../components/search/Result";
import { useAuth } from "../hooks/useAuth";
import { useSearch } from "../hooks/useSearch";
import { useConnectionActions } from "../hooks/useConnections";
import type { BuddyCard } from "../types/buddy";

export default function SearchPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { query, results, loading, error, search, setConnection } = useSearch(userId);
  const { sendRequest, cancelRequest, acceptRequest, rejectRequest, busyId, error: actionError } =
    useConnectionActions(userId);

  // Errors are surfaced via the hook's `error` state.
  const handleConnect = async (peer: BuddyCard) => {
    try {
      const request = await sendRequest(peer.id);
      setConnection(peer.id, "sent", request.id);
    } catch { /* shown below */ }
  };

  const handleCancel = async (peer: BuddyCard) => {
    try {
      await cancelRequest(peer.connectionRequestId);
      setConnection(peer.id, "none");
    } catch { /* shown below */ }
  };

  const handleAccept = async (peer: BuddyCard) => {
    try {
      await acceptRequest(peer.connectionRequestId);
      setConnection(peer.id, "connected", peer.connectionRequestId);
    } catch { /* shown below */ }
  };

  const handleDecline = async (peer: BuddyCard) => {
    try {
      await rejectRequest(peer.connectionRequestId);
      setConnection(peer.id, "none");
    } catch { /* shown below */ }
  };

  const sentCount = results.filter((r) => r.connectionStatus === "sent").length;

  return (
    <div className="pb-10">
      <InputBar value={query} onChange={search} onSearch={search} />
      {actionError && <p className="mt-4 text-center text-xs text-red-400">{actionError}</p>}
      {sentCount > 0 && (
        <p className="mt-4 text-center text-[11px] text-zinc-500">
          Track or withdraw your requests anytime in{" "}
          <Link to="/my-buddies?tab=sent" className="text-emerald-400 hover:underline">
            Buddies → Requested
          </Link>
        </p>
      )}
      <SearchResult
        query={query}
        results={results}
        loading={loading}
        error={error}
        busyId={busyId}
        onConnect={handleConnect}
        onCancel={handleCancel}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}
