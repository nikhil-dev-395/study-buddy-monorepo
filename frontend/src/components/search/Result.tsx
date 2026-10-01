import UserResult from "./User";
import type { BuddyCard } from "../../types/buddy";

type SearchResultProps = {
  query: string;
  results: BuddyCard[];
  loading: boolean;
  error: string | null;
  busyId: number | null;
  onConnect: (peerId: number) => void;
};

export default function SearchResult({
  query,
  results,
  loading,
  error,
  busyId,
  onConnect,
}: SearchResultProps) {
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
        const connected = user.isRequestAccepted;
        const pending = !connected && user.connectionRequestId > 0;

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
            actionLabel={connected ? "Connected" : pending ? "Requested" : "Connect"}
            actionDisabled={connected || pending}
            actionLoading={busyId === user.id}
            onAction={() => onConnect(user.id)}
          />
        );
      })}
    </div>
  );
}
