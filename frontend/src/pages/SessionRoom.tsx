import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiExternalLink, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { fetchSession, liveStatus, useNow, type StudySession } from "../hooks/useSessions";
import { env } from "../utils/env";
import { formatDayLabel, formatRelative, formatTimeRange } from "../utils/time";

const JITSI_DOMAIN = env.VITE_JITSI_DOMAIN || "meet.jit.si";

function roomUrl(session: StudySession, displayName: string) {
  const params = new URLSearchParams({
    "config.prejoinPageEnabled": "false",
    "config.disableDeepLinking": "true",
    "config.subject": session.title,
    "userInfo.displayName": `"${displayName}"`,
  });
  return `https://${JITSI_DOMAIN}/${session.room_id}#${params.toString()}`;
}

export default function SessionRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const now = useNow();
  const [session, setSession] = useState<StudySession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    fetchSession(Number(id), user.id)
      .then(setSession)
      .catch((err) => setError(err instanceof Error ? err.message : "Session not found."));
  }, [id, user]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-3">
        <p className="text-sm text-red-400">{error}</p>
        <Link to="/session" className="text-xs text-emerald-400 hover:underline">
          Back to sessions
        </Link>
      </div>
    );
  }
  if (!session || !user) {
    return <p className="text-center text-xs text-zinc-500 mt-16">Loading room...</p>;
  }

  const status = liveStatus(session, now);
  const url = roomUrl(session, user.username);
  const canJoin = status === "upcoming" || status === "live";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/session"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-zinc-100 truncate">{session.title}</h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <FiClock className="w-3 h-3" />
              {formatDayLabel(session.starts_at)} ·{" "}
              {formatTimeRange(session.starts_at, session.ends_at)} · with {session.partner_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/chat?peer=${session.partner_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100"
          >
            <FiMessageSquare className="w-3.5 h-3.5" /> Chat
          </Link>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100"
          >
            <FiExternalLink className="w-3.5 h-3.5" /> New tab
          </a>
        </div>
      </div>

      {!canJoin ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
          <p className="text-sm text-zinc-300">
            This session is {status === "cancelled" ? "cancelled" : "over"}.
          </p>
        </div>
      ) : joined ? (
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-video max-h-[75vh] w-full">
          <iframe
            src={url}
            title="Study room"
            allow="camera; microphone; display-capture; fullscreen; clipboard-write; autoplay"
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-emerald-500/10 via-zinc-900/60 to-zinc-900/60 p-10 text-center space-y-4">
          <p className="text-xs font-mono text-emerald-400">
            {status === "live" ? "● SESSION IS LIVE" : `Starts ${formatRelative(session.starts_at, now)}`}
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">Ready to study?</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Your camera and mic will be requested. You can join early and wait for{" "}
            {session.partner_name}.
          </p>
          {session.notes && (
            <p className="text-xs text-zinc-300 bg-black/40 border border-zinc-800 rounded-xl p-3 max-w-md mx-auto">
              <span className="text-zinc-500">Agenda: </span>
              {session.notes}
            </p>
          )}
          <button
            onClick={() => setJoined(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold active:scale-95"
          >
            Join video room
          </button>
        </div>
      )}
    </div>
  );
}
