import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiPlus,
  FiVideo,
  FiX,
  FiSearch,
  FiEdit2,
  FiAlertCircle,
  FiUserPlus,
  FiLogOut,
} from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineCheckBadge } from "react-icons/hi2";
import { useAuth } from "../hooks/useAuth";
import { useBuddies } from "../hooks/useConnections";
import {
  MAX_PARTICIPANTS,
  liveStatus,
  participantLabel,
  useNow,
  useSessions,
  type SessionStatus,
  type StudySession,
} from "../hooks/useSessions";
import { AvatarStack, BuddyPicker } from "../components/sessions/Participants";
import {
  formatDayLabel,
  formatRelative,
  formatTimeRange,
  fromDateTimeInputs,
  toDateInput,
  toTimeInput,
} from "../utils/time";

type Filter = "all" | SessionStatus;

const STATUS_STYLES: Record<SessionStatus, string> = {
  upcoming: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  live: "bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse",
  completed: "bg-zinc-800 border-zinc-700 text-zinc-300",
  cancelled: "bg-red-500/10 border-red-500/20 text-red-400",
};

const inputClass =
  "w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none [color-scheme:dark]";

function durationHours(s: StudySession) {
  return (new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 3_600_000;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const now = useNow();

  const {
    sessions,
    loading,
    error,
    refresh,
    createSession,
    rescheduleSession,
    cancelSession,
    addParticipants,
    removeParticipant,
  } = useSessions(userId);
  const { connected, refresh: refreshBuddies } = useBuddies(userId);

  useEffect(() => {
    void refresh();
    void refreshBuddies();
  }, [refresh, refreshBuddies]);

  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [addPeopleSession, setAddPeopleSession] = useState<StudySession | null>(null);
  const [addPeopleIds, setAddPeopleIds] = useState<number[]>([]);

  // Form States
  const [newTitle, setNewTitle] = useState("");
  const [newBuddyIds, setNewBuddyIds] = useState<number[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");

  // Status is re-derived from the clock so cards flip to live/completed on their own.
  const withStatus = useMemo(
    () => sessions.map((s) => ({ ...s, status: liveStatus(s, now) })),
    [sessions, now],
  );

  // --- Handlers ---
  const openCreateModal = () => {
    setFormError(null);
    setNewTitle("");
    setNewBuddyIds([]);
    setNewSkill("");
    setNewNotes("");
    setNewDate(toDateInput(new Date().toISOString()));
    setNewStart("");
    setNewEnd("");
    setIsCreateModalOpen(true);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newStart || !newEnd) return;
    if (newBuddyIds.length === 0) {
      setFormError("Pick at least one buddy to invite.");
      return;
    }
    try {
      setBusy(true);
      setFormError(null);
      await createSession({
        participant_ids: newBuddyIds,
        title: newTitle,
        skill_tag: newSkill || undefined,
        notes: newNotes || undefined,
        starts_at: fromDateTimeInputs(newDate, newStart),
        ends_at: fromDateTimeInputs(newDate, newEnd),
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not schedule session.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelSession = async (id: number) => {
    if (!window.confirm("Cancel this session for both of you?")) return;
    try {
      await cancelSession(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not cancel session.");
    }
  };

  const handleLeave = async (session: StudySession) => {
    if (!userId || !window.confirm("Leave this session? You can be re-added later.")) return;
    try {
      await removeParticipant(session.id, userId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not leave session.");
    }
  };

  const openAddPeople = (session: StudySession) => {
    setFormError(null);
    setAddPeopleIds([]);
    setAddPeopleSession(session);
  };

  const handleAddPeople = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPeopleSession || addPeopleIds.length === 0) return;
    try {
      setBusy(true);
      setFormError(null);
      await addParticipants(addPeopleSession.id, addPeopleIds);
      setAddPeopleSession(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add people.");
    } finally {
      setBusy(false);
    }
  };

  const openRescheduleModal = (session: StudySession) => {
    setFormError(null);
    setSelectedSession(session);
    setRescheduleDate(toDateInput(session.starts_at));
    setRescheduleStart(toTimeInput(session.starts_at));
    setRescheduleEnd(toTimeInput(session.ends_at));
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !rescheduleDate || !rescheduleStart || !rescheduleEnd) return;
    try {
      setBusy(true);
      setFormError(null);
      await rescheduleSession(
        selectedSession.id,
        fromDateTimeInputs(rescheduleDate, rescheduleStart),
        fromDateTimeInputs(rescheduleDate, rescheduleEnd),
      );
      setSelectedSession(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not reschedule.");
    } finally {
      setBusy(false);
    }
  };

  // Filtered Sessions: live first, then upcoming soonest-first, then past newest-first.
  const filteredSessions = withStatus
    .filter((s) => {
      const matchesFilter = filter === "all" ? true : s.status === filter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.title.toLowerCase().includes(q) ||
        s.participants.some((p) => p.name.toLowerCase().includes(q)) ||
        (s.skill_tag ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const rank: Record<SessionStatus, number> = { live: 0, upcoming: 1, completed: 2, cancelled: 3 };
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      const diff = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      return a.status === "upcoming" ? diff : -diff;
    });

  const upcomingCount = withStatus.filter((s) => s.status === "upcoming" || s.status === "live").length;
  const completed = withStatus.filter((s) => s.status === "completed");
  const hoursStudied = completed.reduce((sum, s) => sum + durationHours(s), 0);

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 md:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">
        {/* ========================================================= */}
        {/* 1. TOP HEADER & METRIC CARDS                              */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <FiCalendar className="w-6 h-6 text-emerald-400" />
              1-on-1 Study Sessions
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Schedule 1:1 or group study slots with your buddies and join the video room right here.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-2xl transition active:scale-95 shadow-md shadow-emerald-950/20"
          >
            <FiPlus className="w-4 h-4" />
            <span>Book New Session</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-lg shadow-zinc-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-zinc-400">Upcoming Slots</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{upcomingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiClock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-lg shadow-zinc-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-zinc-400">Completed Sessions</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{completed.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-300">
              <HiOutlineCheckBadge className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-lg shadow-zinc-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-zinc-400">Total Hours Studied</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {Math.round(hoursStudied * 10) / 10} hrs
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FILTER & SEARCH CONTROL BAR                            */}
        {/* ========================================================= */}
        <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-lg shadow-zinc-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {(["all", "live", "upcoming", "completed", "cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition active:scale-95 capitalize border ${
                  filter === tab
                    ? "bg-emerald-500 text-black border-emerald-500 font-semibold shadow-sm"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search topic or partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. SESSIONS LIST                                          */}
        {/* ========================================================= */}
        {loading && sessions.length === 0 && (
          <p className="text-center text-xs text-zinc-500">Loading sessions...</p>
        )}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {error}
          </p>
        )}

        {!loading && filteredSessions.length === 0 ? (
          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-12 text-center shadow-lg shadow-zinc-900/50">
            <FiAlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <h3 className="text-zinc-200 font-semibold text-sm">
              {sessions.length === 0 ? "No sessions yet" : "No sessions match your search"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {sessions.length === 0
                ? "Book your first session with a study buddy."
                : "Try switching filters or scheduling a new session."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => {
              const isActive = session.status === "upcoming" || session.status === "live";
              const isLive = session.status === "live";
              const isCancelled = session.status === "cancelled";

              return (
                <div
                  key={session.id}
                  className={`bg-zinc-900/70 backdrop-blur-md border rounded-2xl p-5 shadow-lg shadow-zinc-900/50 flex flex-col justify-between transition-all duration-200 ${
                    isCancelled
                      ? "border-zinc-800/40 opacity-60"
                      : isLive
                        ? "border-rose-500/40 shadow-rose-950/30"
                        : session.status === "completed"
                          ? "border-zinc-800/50 opacity-80"
                          : "border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    {/* Top Row: relative time & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800 border border-zinc-700/50 px-2.5 py-0.5 rounded-full">
                        {isLive
                          ? `ends ${formatRelative(session.ends_at, now)}`
                          : formatRelative(session.starts_at, now)}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[session.status]}`}
                      >
                        {isLive ? "● LIVE NOW" : session.status.toUpperCase()}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-semibold mt-3 ${isCancelled ? "text-zinc-500 line-through" : "text-zinc-100"}`}
                    >
                      {session.title}
                    </h3>

                    {/* Buddy & Skill Meta */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <AvatarStack people={session.participants} />
                        <span className="text-xs text-zinc-300 font-medium truncate">
                          {participantLabel(session)}
                        </span>
                        {session.participants.length > 1 && (
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            · group of {session.participants.length + 1}
                          </span>
                        )}
                        {!session.is_host && (
                          <span className="text-[10px] text-zinc-500 shrink-0">· invited</span>
                        )}
                      </div>

                      {session.skill_tag && (
                        <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {session.skill_tag}
                        </span>
                      )}
                    </div>

                    {session.notes && (
                      <p className="text-xs text-zinc-400 mt-3 line-clamp-2 bg-black/40 border border-zinc-800/60 p-2.5 rounded-xl">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Date/Time + Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5 text-zinc-500" />
                        {formatDayLabel(session.starts_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5 text-zinc-500" />
                        {formatTimeRange(session.starts_at, session.ends_at)}
                      </span>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {session.participants.length + 1 < MAX_PARTICIPANTS && (
                          <button
                            onClick={() => openAddPeople(session)}
                            className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs transition border border-transparent hover:border-emerald-500/20 active:scale-95"
                            title="Add people"
                          >
                            <FiUserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!session.is_host && (
                          <button
                            onClick={() => handleLeave(session)}
                            className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 text-xs transition border border-transparent hover:border-red-500/20 active:scale-95"
                            title="Leave session"
                          >
                            <FiLogOut className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isLive && session.is_host && (
                          <>
                            <button
                              onClick={() => openRescheduleModal(session)}
                              className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs transition border border-transparent hover:border-zinc-700 active:scale-95"
                              title="Reschedule"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCancelSession(session.id)}
                              className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 text-xs transition border border-transparent hover:border-red-500/20 active:scale-95"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        <Link
                          to={`/session/${session.id}/room`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition active:scale-95 shadow-sm ${
                            isLive
                              ? "bg-rose-500 hover:bg-rose-400 text-white"
                              : "bg-emerald-500 hover:bg-emerald-400 text-black"
                          }`}
                        >
                          <FiVideo className="w-3.5 h-3.5" />
                          <span>{isLive ? "Join now" : "Open room"}</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL: CREATE SESSION                                  */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-zinc-100 font-semibold text-base flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-emerald-400" />
                Schedule Peer Session
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {connected.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-zinc-300">You need a study buddy first.</p>
                <p className="text-xs text-zinc-500">
                  Sessions can only be booked with accepted buddies.
                </p>
                <Link
                  to="/search"
                  className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl"
                >
                  Find a buddy
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateSession} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Session Topic / Goal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Revise Trees & Graph traversal"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 flex items-center justify-between mb-1.5">
                    <span>Invite buddies</span>
                    <span className="text-[10px] text-zinc-500">
                      {newBuddyIds.length} selected · pick several for a group session
                    </span>
                  </label>
                  <BuddyPicker
                    buddies={connected}
                    selected={newBuddyIds}
                    onChange={setNewBuddyIds}
                    max={MAX_PARTICIPANTS - 1}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Skill Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      min={toDateInput(new Date().toISOString())}
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">Start</label>
                    <input
                      type="time"
                      required
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">End</label>
                    <input
                      type="time"
                      required
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Agenda / Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What will you cover together?"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <FiVideo className="w-3.5 h-3.5 text-emerald-400" />A private video room is
                  created automatically — no Meet link needed.
                </p>

                {formError && <p className="text-xs text-red-400">{formError}</p>}

                <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-semibold text-xs rounded-xl transition active:scale-95 shadow-sm"
                  >
                    {busy ? "Scheduling..." : "Confirm & Schedule"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: ADD PEOPLE                                      */}
      {/* ========================================================= */}
      {addPeopleSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-zinc-100 font-semibold text-sm flex items-center gap-2">
                  <FiUserPlus className="w-4 h-4 text-emerald-400" /> Add people
                </h3>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{addPeopleSession.title}</p>
              </div>
              <button
                onClick={() => setAddPeopleSession(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPeople} className="space-y-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <AvatarStack people={addPeopleSession.participants} max={6} />
                <span>already in · {addPeopleSession.participants.length + 1} people</span>
              </div>
              {connected.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  You can only add your own buddies.{" "}
                  <Link to="/search" className="text-emerald-400 hover:underline">
                    Find buddies
                  </Link>
                </p>
              ) : (
                <BuddyPicker
                  buddies={connected}
                  selected={addPeopleIds}
                  onChange={setAddPeopleIds}
                  disabledIds={[
                    addPeopleSession.host_id,
                    ...addPeopleSession.participants.map((p) => p.id),
                  ]}
                  max={MAX_PARTICIPANTS - 1 - addPeopleSession.participants.length}
                />
              )}
              <p className="text-[11px] text-zinc-500">
                They'll see this session on their Sessions page and can join the same video room.
              </p>
              {formError && <p className="text-xs text-red-400">{formError}</p>}
              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAddPeopleSession(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || addPeopleIds.length === 0}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-semibold text-xs rounded-xl transition active:scale-95"
                >
                  {busy ? "Adding..." : `Add ${addPeopleIds.length || ""}`.trim()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: RESCHEDULE SESSION                              */}
      {/* ========================================================= */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-zinc-100 font-semibold text-sm">Reschedule Session</h3>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  {selectedSession.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Start</label>
                  <input
                    type="time"
                    required
                    value={rescheduleStart}
                    onChange={(e) => setRescheduleStart(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">End</label>
                  <input
                    type="time"
                    required
                    value={rescheduleEnd}
                    onChange={(e) => setRescheduleEnd(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-semibold text-xs rounded-xl transition active:scale-95 shadow-sm"
                >
                  {busy ? "Saving..." : "Save New Time"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
