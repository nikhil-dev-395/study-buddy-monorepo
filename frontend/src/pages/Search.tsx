import InputBar from "../components/search/InputBar";
import SearchResult from "../components/search/Result";
import { useAuth } from "../hooks/useAuth";
import { useSearch } from "../hooks/useSearch";
import { useConnectionActions } from "../hooks/useConnections";

export default function SearchPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { query, results, loading, error, search, markPending } = useSearch(userId);
  const { sendRequest, busyId } = useConnectionActions(userId);

  const handleConnect = async (peerId: number) => {
    try {
      const request = await sendRequest(peerId);
      markPending(peerId, request.id);
    } catch {
      // Error surfaced via the hook's `error` state is enough for now.
    }
  };

  return (
    <div className="pb-10">
      <InputBar value={query} onChange={search} onSearch={search} />
      <SearchResult
        query={query}
        results={results}
        loading={loading}
        error={error}
        busyId={busyId}
        onConnect={handleConnect}
      />
    </div>
  );
}
