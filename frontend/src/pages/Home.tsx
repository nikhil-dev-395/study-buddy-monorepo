import { Link } from "react-router-dom";

export default function HomePage() {
  const user = { name: "Alex" };

  const upcomingSession = {
    partnerName: "Sarah Chen",
    partnerAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
    topic: "System Design & Consistent Hashing",
    time: "Today • 7:00 PM",
  };

  const pendingRequests = [
    {
      id: "req_1",
      name: "Marcus Vance",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
      subject: "AWS Certified Architect",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 space-y-10">
      {/* 1. Subtle Hero Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-zinc-100 tracking-tight">
            Good evening, {user.name}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            1 session scheduled for today
          </p>
        </div>

        <Link
          to="/search"
          className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-colors shadow-sm"
        >
          Find partner
        </Link>
      </div>

      {/* 2. Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Session (2 Cols) */}
        <div className="md:col-span-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-400">Next Session</span>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {upcomingSession.time}
            </span>
          </div>

          {upcomingSession ? (
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={upcomingSession.partnerAvatar}
                  alt={upcomingSession.partnerName}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-zinc-200 truncate">
                    {upcomingSession.topic}
                  </h4>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    with {upcomingSession.partnerName}
                  </p>
                </div>
              </div>

              <Link
                to="/chat"
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700/50 shrink-0"
              >
                Join chat
              </Link>
            </div>
          ) : (
            <p className="text-xs text-zinc-600 py-2">No upcoming sessions.</p>
          )}
        </div>

        {/* Requests Sidebar (1 Col) */}
        <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Invites</span>
            <span className="font-mono text-[10px] text-zinc-500">
              {pendingRequests.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {req.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {req.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button className="flex-1 py-1 rounded bg-zinc-200 hover:bg-white text-zinc-950 font-medium text-[11px] transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AI Utilities Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-zinc-500">Tools</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/ai/roadmap"
            className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700 transition-all group space-y-1.5"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Generator
            </span>
            <h4 className="text-xs font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
              Study Roadmap
            </h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              30-day structured study plans.
            </p>
          </Link>

          <Link
            to="/ai/quiz"
            className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700 transition-all group space-y-1.5"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Practice
            </span>
            <h4 className="text-xs font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
              AI Quizzer
            </h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Topic quizzes with explanations.
            </p>
          </Link>

          <Link
            to="/ai/summarizer"
            className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700 transition-all group space-y-1.5"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Utility
            </span>
            <h4 className="text-xs font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
              Notes Summarizer
            </h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Extract key takeaways from text.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
