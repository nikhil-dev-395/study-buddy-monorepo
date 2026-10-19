import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiHelpCircle,
  FiMessageCircle,
  FiSearch,
  FiUsers,
  FiVideo,
  FiX,
  FiZap,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useMessages, type ConversationPreview } from "../hooks/useMessages";
import { useBuddies, useConnectionActions } from "../hooks/useConnections";
import { liveStatus, useNow, useSessions } from "../hooks/useSessions";
import {
  formatClock,
  formatDayLabel,
  formatRelative,
  formatTimeRange,
  greetingForNow,
} from "../utils/time";

function Avatar({
  name,
  src,
  size = "w-12 h-12",
  ring = "",
}: {
  name: string;
  src: string | null | undefined;
  size?: string;
  ring?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setBroken(true)}
        className={`${size} ${ring} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${size} ${ring} rounded-full shrink-0 bg-gradient-to-br from-emerald-500/30 to-sky-500/20 border border-zinc-700/60 flex items-center justify-center text-emerald-300 font-semibold`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function chatTime(iso: string | null) {
  if (!iso) return "";
  return formatDayLabel(iso) === "Today" ? formatClock(iso) : formatDayLabel(iso);
}

const QUICK_ACTIONS = [
  { to: "/search", label: "Find a partner", hint: "Match by subject", icon: FiSearch, tint: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { to: "/session", label: "Book a session", hint: "With video room", icon: FiCalendar, tint: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { to: "/ai?tab=tutor", label: "Ask the AI tutor", hint: "Explain any topic", icon: FiZap, tint: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  { to: "/ai?tab=quiz", label: "Quiz yourself", hint: "5-min knowledge check", icon: FiHelpCircle, tint: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
];

export default function HomePage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const navigate = useNavigate();
  const now = useNow();

  const { profile, refresh: refreshProfile } = useProfile(userId);
  const { conversations } = useMessages(userId);
  const { sessions, refresh: refreshSessions } = useSessions(userId);
  const { connected, incoming, refresh: refreshBuddies } = useBuddies(userId);
  const { acceptRequest, rejectRequest, busyId } = useConnectionActions(userId);

  useEffect(() => {
    void refreshProfile();
    void refreshBuddies();
    void refreshSessions();
  }, [refreshProfile, refreshBuddies, refreshSessions]);

  const firstName = (profile?.name || user?.username || "there").split(" ")[0];

  // WhatsApp-style ordering: unread first, then most recent message.
  const chats = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        if (!!b.unread_count !== !!a.unread_count) return b.unread_count - a.unread_count;
        return (
          new Date(b.last_message_time ?? 0).getTime() -
          new Date(a.last_message_time ?? 0).getTime()
        );
      }),
    [conversations],
  );
  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const activeSessions = sessions
    .map((s) => ({ ...s, status: liveStatus(s, now) }))
    .filter((s) => s.status === "upcoming" || s.status === "live");
  const nextSession = activeSessions[0] ?? null;
  const todayCount = activeSessions.filter((s) => formatDayLabel(s.starts_at) === "Today").length;

  const weekAgo = now - 7 * 24 * 3_600_000;
  const hoursThisWeek = sessions
    .filter((s) => liveStatus(s, now) === "completed" && new Date(s.ends_at).getTime() > weekAgo)
    .reduce((sum, s) => sum + (new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 3_600_000, 0);

  const openChat = (c: ConversationPreview) => navigate(`/chat?peer=${c.peer_id}`);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* 1. Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-emerald-500/15 via-zinc-900/80 to-sky-500/10 p-6 md:p-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-mono text-emerald-400/90">
              {new Date(now).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50 tracking-tight mt-1">
              {greetingForNow()}, {firstName} 👋
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">
              {todayCount > 0
                ? `You have ${todayCount} study session${todayCount > 1 ? "s" : ""} today.`
                : unreadTotal > 0
                  ? `You have ${unreadTotal} unread message${unreadTotal > 1 ? "s" : ""}.`
                  : "Nothing scheduled today — a good time to plan one."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { label: "Buddies", value: connected.length, icon: FiUsers },
              { label: "Upcoming", value: activeSessions.length, icon: FiCalendar },
              { label: "Hrs this week", value: Math.round(hoursThisWeek * 10) / 10, icon: FiBookOpen },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-black/30 border border-zinc-800/80 px-3 py-2.5 min-w-[88px]"
              >
                <stat.icon className="w-3.5 h-3.5 text-zinc-500" />
                <p className="text-xl font-semibold text-zinc-100 mt-1">{stat.value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Direct messages — WhatsApp-style avatar strip */}
      <section className="rounded-2xl bg-zinc-900/50 border border-zinc-800/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <FiMessageCircle className="w-4 h-4 text-emerald-400" /> Direct messages
            {unreadTotal > 0 && (
              <span className="text-[10px] font-mono bg-emerald-500 text-black rounded-full px-1.5 py-0.5">
                {unreadTotal}
              </span>
            )}
          </h2>
          <Link to="/chat" className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1">
            Open chats <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {chats.length === 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-800 p-4">
            <p className="text-xs text-zinc-500">Connect with a study buddy to start messaging.</p>
            <Link to="/search" className="text-xs font-medium text-emerald-400 hover:underline shrink-0">
              Find buddies
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {chats.map((c) => (
                <button
                  key={c.peer_id}
                  onClick={() => openChat(c)}
                  className="flex flex-col items-center gap-1.5 w-16 shrink-0 group"
                  title={`Message ${c.name}`}
                >
                  <div className="relative">
                    <Avatar
                      name={c.name}
                      src={c.avatar_url}
                      size="w-14 h-14"
                      ring={
                        c.unread_count > 0
                          ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950"
                          : "ring-1 ring-zinc-700 group-hover:ring-zinc-500"
                      }
                    />
                    {c.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center border-2 border-zinc-950">
                        {c.unread_count > 9 ? "9+" : c.unread_count}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-300 truncate w-full text-center group-hover:text-white">
                    {c.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 divide-y divide-zinc-800/60">
              {chats.slice(0, 4).map((c) => (
                <button
                  key={c.peer_id}
                  onClick={() => openChat(c)}
                  className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-zinc-800/30 rounded-lg px-2 -mx-2 transition"
                >
                  <Avatar name={c.name} src={c.avatar_url} size="w-9 h-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${c.unread_count ? "font-semibold text-zinc-100" : "text-zinc-200"}`}>
                        {c.name}
                      </p>
                      <span className={`text-[10px] shrink-0 ${c.unread_count ? "text-emerald-400" : "text-zinc-500"}`}>
                        {chatTime(c.last_message_time)}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${c.unread_count ? "text-zinc-300" : "text-zinc-500"}`}>
                      {c.last_message ?? "Say hello 👋"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 3. Next session + invites */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="md:col-span-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-200 text-sm flex items-center gap-2">
              <FiVideo className="w-4 h-4 text-emerald-400" /> Next session
            </span>
            {nextSession && (
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                  nextSession.status === "live"
                    ? "text-rose-300 bg-rose-500/15 animate-pulse"
                    : "text-emerald-400 bg-emerald-500/10"
                }`}
              >
                {nextSession.status === "live" ? "● LIVE NOW" : `starts ${formatRelative(nextSession.starts_at, now)}`}
              </span>
            )}
          </div>

          {nextSession ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={nextSession.partner_name} src={nextSession.partner_avatar} size="w-11 h-11" />
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-zinc-100 truncate">{nextSession.title}</h4>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    with {nextSession.partner_name} · {formatDayLabel(nextSession.starts_at)},{" "}
                    {formatTimeRange(nextSession.starts_at, nextSession.ends_at)}
                  </p>
                </div>
              </div>
              <Link
                to={`/session/${nextSession.id}/room`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition active:scale-95 ${
                  nextSession.status === "live"
                    ? "bg-rose-500 hover:bg-rose-400 text-white"
                    : "bg-zinc-100 hover:bg-white text-zinc-950"
                }`}
              >
                {nextSession.status === "live" ? "Join now" : "Open room"}
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-800 p-4">
              <p className="text-xs text-zinc-500">No upcoming sessions.</p>
              <Link to="/session" className="text-xs font-medium text-emerald-400 hover:underline">
                Book one
              </Link>
            </div>
          )}

          {activeSessions.length > 1 && (
            <div className="pt-3 border-t border-zinc-800/60 space-y-2">
              {activeSessions.slice(1, 3).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 truncate">{s.title}</span>
                  <span className="text-zinc-500 font-mono shrink-0 ml-3">
                    {formatDayLabel(s.starts_at)} {formatClock(s.starts_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-zinc-900/50 border border-zinc-800/70 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sm text-zinc-200">Buddy requests</span>
            <span className="font-mono text-[10px] text-zinc-500">{incoming.length}</span>
          </div>

          {incoming.length === 0 && <p className="text-xs text-zinc-500 py-2">No new requests.</p>}

          <div className="space-y-3">
            {incoming.slice(0, 3).map((req) => {
              const name = req.sender_name ?? `User #${req.sender_id}`;
              return (
                <div key={req.id} className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={name} src={req.sender_avatar} size="w-8 h-8" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-200 truncate">{name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {req.sender_subjects?.slice(0, 2).join(", ") || req.sender_headline || "Wants to study with you"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={busyId === req.id}
                      onClick={async () => {
                        await acceptRequest(req.id);
                        void refreshBuddies();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[11px] disabled:opacity-40"
                    >
                      <FiCheck className="w-3 h-3" /> Accept
                    </button>
                    <button
                      disabled={busyId === req.id}
                      onClick={async () => {
                        await rejectRequest(req.id);
                        void refreshBuddies();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] disabled:opacity-40"
                    >
                      <FiX className="w-3 h-3" /> Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {incoming.length > 3 && (
            <Link to="/my-buddies" className="block text-[11px] text-emerald-400 hover:underline">
              See all {incoming.length} requests
            </Link>
          )}
        </section>
      </div>

      {/* 4. Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="group rounded-2xl bg-zinc-900/50 border border-zinc-800/70 hover:border-zinc-700 p-4 transition"
          >
            <span className={`inline-flex p-2 rounded-xl border ${a.tint}`}>
              <a.icon className="w-4 h-4" />
            </span>
            <p className="text-sm font-medium text-zinc-100 mt-3 flex items-center gap-1">
              {a.label}
              <FiArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{a.hint}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
