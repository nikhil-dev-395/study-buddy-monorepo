import React, { useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiPlus,
  FiVideo,
  FiUser,
  FiX,
  FiCheckCircle,
  FiSearch,
  FiEdit2,
  FiAlertCircle,
  FiChevronRight,
} from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineCheckBadge } from "react-icons/hi2";

// --- Types ---
export type SessionStatus = "upcoming" | "completed" | "cancelled";

export interface Session {
  id: string;
  title: string;
  buddyName: string;
  buddyAvatar: string;
  skillTag: string;
  date: string;
  time: string;
  status: SessionStatus;
  meetLink?: string;
  notes?: string;
}

// --- Mock Data ---
const INITIAL_SESSIONS: Session[] = [
  {
    id: "SES-9042",
    title: "FastAPI & Supabase JWT Auth Flow",
    buddyName: "Sarah Jenkins",
    buddyAvatar: "SJ",
    skillTag: "FastAPI & Python",
    date: "Today, Aug 15",
    time: "4:00 PM - 5:00 PM",
    status: "upcoming",
    meetLink: "https://meet.google.com/xyz-auth-sync",
    notes: "Review refresh token rotation and RLS policies on Supabase.",
  },
  {
    id: "SES-8812",
    title: "Tailwind Dark System & Component Specs",
    buddyName: "Alex Chen",
    buddyAvatar: "AC",
    skillTag: "UI/UX Design",
    date: "Tomorrow, Aug 16",
    time: "11:00 AM - 11:45 AM",
    status: "upcoming",
    meetLink: "https://meet.google.com/abc-ui-review",
    notes: "Walk through micro-interactions and button active scaling.",
  },
  {
    id: "SES-7631",
    title: "Data Structures: Tree Traversals & DFS",
    buddyName: "Priya Sharma",
    buddyAvatar: "PS",
    skillTag: "Data Structures",
    date: "Aug 12, 2026",
    time: "2:00 PM - 3:00 PM",
    status: "completed",
    notes: "Completed 4 LeetCode medium questions together.",
  },
  {
    id: "SES-6510",
    title: "System Design: Load Balancers & Redis",
    buddyName: "Alex Chen",
    buddyAvatar: "AC",
    skillTag: "FastAPI & Python",
    date: "Aug 10, 2026",
    time: "6:00 PM - 7:00 PM",
    status: "cancelled",
    notes: "Rescheduled due to exam clash.",
  },
];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Form States
  const [newTitle, setNewTitle] = useState("");
  const [newBuddy, setNewBuddy] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newMeetLink, setNewMeetLink] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // --- Handlers ---
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime) return;

    const newEntry: Session = {
      id: `SES-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      buddyName: newBuddy || "Study Partner",
      buddyAvatar: newBuddy ? newBuddy.substring(0, 2).toUpperCase() : "SP",
      skillTag: newSkill || "General Study",
      date: newDate,
      time: newTime,
      status: "upcoming",
      meetLink: newMeetLink || "https://meet.google.com/new-session",
    };

    setSessions([newEntry, ...sessions]);
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewBuddy("");
    setNewSkill("");
    setNewDate("");
    setNewTime("");
    setNewMeetLink("");
  };

  const handleCancelSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s)),
    );
  };

  const openRescheduleModal = (session: Session) => {
    setSelectedSession(session);
    setRescheduleDate(session.date);
    setRescheduleTime(session.time);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !rescheduleDate || !rescheduleTime) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? {
              ...s,
              date: rescheduleDate,
              time: rescheduleTime,
              status: "upcoming",
            }
          : s,
      ),
    );
    setIsRescheduleModalOpen(false);
    setSelectedSession(null);
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filter === "all" ? true : s.status === filter;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.buddyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skillTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const upcomingCount = sessions.filter((s) => s.status === "upcoming").length;
  const completedCount = sessions.filter(
    (s) => s.status === "completed",
  ).length;

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
              Organize peer reviews, pair programming, and skill mentorship
              slots.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
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
              <p className="text-xs font-mono uppercase text-zinc-400">
                Upcoming Slots
              </p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">
                {upcomingCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FiClock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-lg shadow-zinc-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-zinc-400">
                Completed Sessions
              </p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">
                {completedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-300">
              <HiOutlineCheckBadge className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-lg shadow-zinc-900/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-zinc-400">
                Total Hours Studied
              </p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {completedCount * 1.5} hrs
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
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {(["all", "upcoming", "completed", "cancelled"] as const).map(
              (tab) => (
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
              ),
            )}
          </div>

          {/* Search Box */}
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
        {filteredSessions.length === 0 ? (
          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-12 text-center shadow-lg shadow-zinc-900/50">
            <FiAlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <h3 className="text-zinc-200 font-semibold text-sm">
              No sessions match your search
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try switching filters or scheduling a new session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => {
              const isUpcoming = session.status === "upcoming";
              const isCancelled = session.status === "cancelled";

              return (
                <div
                  key={session.id}
                  className={`bg-zinc-900/70 backdrop-blur-md border rounded-2xl p-5 shadow-lg shadow-zinc-900/50 flex flex-col justify-between transition-all duration-200 ${
                    isCancelled
                      ? "border-zinc-800/40 opacity-60"
                      : "border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    {/* Top Row: Monospace ID & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800 border border-zinc-700/50 px-2.5 py-0.5 rounded-full">
                        {session.id}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                          session.status === "upcoming"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : session.status === "completed"
                              ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {session.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Session Title */}
                    <h3
                      className={`text-base font-semibold mt-3 ${isCancelled ? "text-zinc-500 line-through" : "text-zinc-100"}`}
                    >
                      {session.title}
                    </h3>

                    {/* Buddy & Skill Meta */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-200">
                          {session.buddyAvatar}
                        </div>
                        <span className="text-xs text-zinc-300 font-medium">
                          {session.buddyName}
                        </span>
                      </div>

                      <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {session.skillTag}
                      </span>
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
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5 text-zinc-500" />
                        {session.time}
                      </span>
                    </div>

                    {/* Actions */}
                    {isUpcoming && (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
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

                        {session.meetLink && (
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-xl transition active:scale-95 shadow-sm"
                          >
                            <FiVideo className="w-3.5 h-3.5" />
                            <span>Join</span>
                          </a>
                        )}
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

            <form onSubmit={handleCreateSession} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Session Topic / Goal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FastAPI Auth System Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Study Partner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={newBuddy}
                    onChange={(e) => setNewBuddy(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Skill Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FastAPI & Python"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aug 18, 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Time Range
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3:00 PM - 4:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Meeting Link (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-123"
                  value={newMeetLink}
                  onChange={(e) => setNewMeetLink(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                />
              </div>

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
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition active:scale-95 shadow-sm"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: RESCHEDULE SESSION                              */}
      {/* ========================================================= */}
      {isRescheduleModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-zinc-100 font-semibold text-sm">
                  Reschedule Session
                </h3>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  {selectedSession.title}
                </p>
              </div>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  New Date
                </label>
                <input
                  type="text"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  New Time Range
                </label>
                <input
                  type="text"
                  required
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition active:scale-95 shadow-sm"
                >
                  Save New Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
