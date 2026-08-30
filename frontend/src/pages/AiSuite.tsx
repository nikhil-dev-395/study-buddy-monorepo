import React, { useState } from "react";
import {
  FiMap,
  FiHelpCircle,
  FiFileText,
  FiMessageSquare,
  FiSend,

  FiCheckCircle,

  FiRefreshCw,

  FiCpu,
  FiZap,
  FiChevronRight,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

export default function AiSuitePage() {
  const [activeTab, setActiveTab] = useState<
    "roadmap" | "quiz" | "summarizer" | "tutor"
  >("roadmap");

  // --- AI 1: Roadmap State ---
  const [goal, setGoal] = useState("Build full-stack app with FastAPI & React");
  const [days, setDays] = useState("30");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [roadmapResult, setRoadmapResult] = useState<any[]>([
    {
      phase: "Phase 1 (Days 1–10): Backend Fundamentals",
      topics: [
        "FastAPI REST API design",
        "JWT authentication & Refresh tokens",
        "Supabase PostgreSQL integration",
      ],
      project: "Build authenticated user CRUD API",
    },
    {
      phase: "Phase 2 (Days 11–20): Frontend & Real-time State",
      topics: [
        "React modular component design",
        "Tailwind Dark System",
        "WebSocket real-time chat setup",
      ],
      project: "Connect React dashboard with live message feeds",
    },
    {
      phase: "Phase 3 (Days 21–30): Integration & AI Copilot Tools",
      topics: [
        "Model Context Protocol (MCP) tool integration",
        "Session scheduler syncing",
        "Deployment",
      ],
      project: "Ship full StudyBuddy MVP",
    },
  ]);

  // --- AI 2: Quiz State ---
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quizTopic, setQuizTopic] = useState("FastAPI & System Design");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const mockQuiz = [
    {
      id: 1,
      question:
        "Which header should contain the JWT access token in REST API requests?",
      options: [
        "Cookie: jwt_token",
        "Authorization: Bearer <token>",
        "Content-Type: application/jwt",
        "X-Auth-Key: <token>",
      ],
      correct: 1,
      explanation:
        "Bearers in the Authorization header are standard for OAuth2/JWT workflows.",
    },
    {
      id: 2,
      question:
        "In Model Context Protocol (MCP), what is the role of an MCP Tool?",
      options: [
        "To provide styling for the UI",
        "An executable function the AI can invoke to retrieve data or take action",
        "A database migration manager",
        "A static text prompt",
      ],
      correct: 1,
      explanation:
        "MCP Tools allow LLMs to invoke external APIs, perform queries, or execute tasks dynamically.",
    },
  ];

  // --- AI 3: Summarizer State ---
  const [notesInput, setNotesInput] = useState("");
  const [summaryResult, setSummaryResult] = useState<{
    overview: string;
    keyPoints: string[];
    actionItems: string[];
  } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleGenerateSummary = () => {
    if (!notesInput.trim()) return;
    setIsSummarizing(true);
    setTimeout(() => {
      setSummaryResult({
        overview:
          "Overview of asynchronous Python API design using FastAPI and Supabase database interactions.",
        keyPoints: [
          "FastAPI uses Starlette and Pydantic for high-performance async validation.",
          "JWT Access tokens should have short expiry (15-60 min) with rotated refresh tokens.",
          "Model Context Protocol enables zero-friction AI tool connectivity without custom glue code.",
        ],
        actionItems: [
          "Add rate limiting middleware to auth endpoints.",
          "Implement WebSocket heartbeats for chat connectivity.",
        ],
      });
      setIsSummarizing(false);
    }, 800);
  };

  // --- AI 4: AI Tutor State ---
  const [tutorChat, setTutorChat] = useState<
    { sender: "user" | "ai"; text: string; actionChip?: string }[]
  >([
    {
      sender: "ai",
      text: "Hello! I am your StudyBuddy AI Copilot. I can explain complex CS topics, debug code, or check your schedule.",
    },
  ]);
  const [tutorInput, setTutorInput] = useState("");

  const handleSendTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim()) return;

    const userText = tutorInput;
    setTutorChat((prev) => [...prev, { sender: "user", text: userText }]);
    setTutorInput("");

    setTimeout(() => {
      setTutorChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Here is the breakdown for "${userText}": In a production setup, you decouple state management from UI rendering. Would you like me to trigger an MCP Tool to automatically book a peer review session with Sarah Jenkins?`,
          actionChip: "⚡ MCP Tool: Schedule Sync with Sarah Jenkins",
        },
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 md:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FiZap className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-zinc-100">
                StudyBuddy AI Suite
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Context-aware study tools powered by Structured AI and Model
              Context Protocol (MCP).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              MODEL: GPT-4o / Claude 3.5 • MCP ACTIVE
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 shadow-lg shadow-zinc-900/50">
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition active:scale-95 ${
              activeTab === "roadmap"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FiMap className="w-4 h-4" />
            <span>AI Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition active:scale-95 ${
              activeTab === "quiz"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FiHelpCircle className="w-4 h-4" />
            <span>Quiz Generator</span>
          </button>

          <button
            onClick={() => setActiveTab("summarizer")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition active:scale-95 ${
              activeTab === "summarizer"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Notes Summarizer</span>
          </button>

          <button
            onClick={() => setActiveTab("tutor")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition active:scale-95 ${
              activeTab === "tutor"
                ? "bg-emerald-500 text-black shadow-md"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            <span>AI Chat Tutor</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: AI STUDY ROADMAP                                   */}
        {/* ========================================================= */}
        {activeTab === "roadmap" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Input Controls */}
            <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-zinc-900/50 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-8">
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  What is your learning goal?
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                  placeholder="e.g. Master FastAPI backend & SQL query optimization"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Duration
                </label>
                <select
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                >
                  <option value="15">15 Days (Crash)</option>
                  <option value="30">30 Days (Standard)</option>
                  <option value="60">60 Days (Deep Dive)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={() => setIsGeneratingRoadmap(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition active:scale-95 shadow-sm"
                >
                  <HiOutlineSparkles className="w-4 h-4" />
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Generated Plan Output */}
            <div className="space-y-3">
              {roadmapResult.map((phase, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-zinc-900/50 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {phase.phase}
                    </h3>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      MILESTONE {idx + 1}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {phase.topics.map((t: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-zinc-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {t}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-mono text-[11px]">
                      🎯 Practical Deliverable:{" "}
                      <strong className="text-zinc-200">{phase.project}</strong>
                    </span>
                    <button className="text-emerald-400 hover:underline text-[11px] font-medium flex items-center gap-1">
                      Find Peer for this Phase{" "}
                      <FiChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AI QUIZ GENERATOR                                  */}
        {/* ========================================================= */}
        {activeTab === "quiz" && (
          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-lg shadow-zinc-900/50 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  Interactive Knowledge Check
                </h3>
                <p className="text-xs text-zinc-400">
                  Test yourself on:{" "}
                  <span className="text-emerald-400 font-mono">
                    {quizTopic}
                  </span>
                </p>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs rounded-xl transition active:scale-95">
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate 5 Questions</span>
              </button>
            </div>

            {/* Questions Stream */}
            <div className="space-y-6">
              {mockQuiz.map((q, qIndex) => {
                const selected = selectedAnswers[q.id];
                const isSubmitted = quizScore !== null;

                return (
                  <div key={q.id} className="space-y-3">
                    <h4 className="text-xs md:text-sm font-medium text-zinc-200">
                      <span className="font-mono text-emerald-400 mr-2">
                        Q{qIndex + 1}.
                      </span>
                      {q.question}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIndex) => {
                        const isThisSelected = selected === optIndex;
                        const isCorrect = q.correct === optIndex;

                        let style =
                          "bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700";
                        if (isThisSelected)
                          style =
                            "bg-emerald-500/10 border-emerald-500 text-emerald-300";
                        if (isSubmitted) {
                          if (isCorrect)
                            style =
                              "bg-emerald-500/20 border-emerald-500 text-emerald-200";
                          else if (isThisSelected && !isCorrect)
                            style = "bg-red-500/20 border-red-500 text-red-200";
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() =>
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [q.id]: optIndex,
                              })
                            }
                            className={`p-3 rounded-xl border text-left text-xs transition active:scale-95 flex items-start gap-2.5 ${style}`}
                          >
                            <span className="font-mono text-[10px] opacity-60">
                              [{String.fromCharCode(65 + optIndex)}]
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <p className="text-xs text-zinc-400 bg-black/40 border border-zinc-800/80 p-2.5 rounded-xl font-mono text-[11px]">
                        💡 Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              {quizScore !== null ? (
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  Score: {quizScore} / {mockQuiz.length} Correct
                </span>
              ) : (
                <div />
              )}

              <button
                onClick={() => {
                  let correctCount = 0;
                  mockQuiz.forEach((q) => {
                    if (selectedAnswers[q.id] === q.correct) correctCount++;
                  });
                  setQuizScore(correctCount);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition active:scale-95 shadow-md"
              >
                Submit Answers
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AI NOTES SUMMARIZER                                */}
        {/* ========================================================= */}
        {activeTab === "summarizer" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Input Box */}
            <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-zinc-900/50 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Paste Study Notes / Transcripts
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Extract executive summaries, key terms, and action steps.
                </p>

                <textarea
                  rows={10}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Paste lecture notes, code snippets, or documentation here..."
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 mt-3 focus:border-zinc-600 focus:outline-none resize-none font-mono"
                />
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing || !notesInput.trim()}
                className="mt-3 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-semibold text-xs rounded-xl transition active:scale-95"
              >
                <HiOutlineSparkles className="w-4 h-4" />
                <span>
                  {isSummarizing
                    ? "Summarizing..."
                    : "Generate Structured Summary"}
                </span>
              </button>
            </div>

            {/* Output Box */}
            <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-zinc-900/50 flex flex-col justify-between">
              {summaryResult ? (
                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      EXECUTIVE SUMMARY
                    </span>
                    <p className="text-xs text-zinc-200 mt-2 leading-relaxed">
                      {summaryResult.overview}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                      Key Takeaways
                    </h4>
                    <ul className="mt-1.5 space-y-1">
                      {summaryResult.keyPoints.map((kp, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-zinc-300 flex items-start gap-2"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                      Action Items
                    </h4>
                    <ul className="mt-1.5 space-y-1">
                      {summaryResult.actionItems.map((ai, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-zinc-300 flex items-start gap-2"
                        >
                          <span className="font-mono text-[10px] text-zinc-500 mt-0.5">
                            [{idx + 1}]
                          </span>
                          <span>{ai}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                  <FiFileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">
                    Paste your notes on the left and click summarize to see key
                    points.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: AI CHAT TUTOR (WITH MCP TOOL HOOKS)               */}
        {/* ========================================================= */}
        {activeTab === "tutor" && (
          <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-lg shadow-zinc-900/50 flex flex-col h-[560px] overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FiCpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-100">
                    StudyBuddy Intelligent Agent
                  </h3>
                  <span className="font-mono text-[10px] text-emerald-400">
                    Tool calling & Schedule context connected
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {tutorChat.map((msg, index) => {
                const isMe = msg.sender === "user";
                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs md:text-sm ${
                        isMe
                          ? "bg-emerald-500 text-black font-medium rounded-br-none"
                          : "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>

                      {msg.actionChip && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
                          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono hover:bg-emerald-500/20 transition active:scale-95">
                            {msg.actionChip}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendTutor}
              className="p-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask any technical concept or say 'Help me plan a session with Sarah'..."
                className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition active:scale-95 shadow-sm"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
