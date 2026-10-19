import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiMap,
  FiHelpCircle,
  FiFileText,
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiZap,
  FiChevronRight,
  FiTrash2,
  FiRotateCw,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import Markdown from "../components/ai/Markdown";
import {
  useAiSuite,
  type NotesSummary,
  type QuizDifficulty,
  type QuizQuestion,
  type RoadmapPhase,
  type TutorMessage,
} from "../hooks/useAiSuite";

type Tab = "tutor" | "quiz" | "summarizer" | "roadmap";

const TABS: { key: Tab; label: string; hint: string; icon: typeof FiMap }[] = [
  { key: "tutor", label: "Ask Tutor", hint: "Explain any topic", icon: FiMessageSquare },
  { key: "quiz", label: "Practice Quiz", hint: "Test yourself", icon: FiHelpCircle },
  { key: "summarizer", label: "Notes → Flashcards", hint: "Revise faster", icon: FiFileText },
  { key: "roadmap", label: "Study Plan", hint: "Day-by-day roadmap", icon: FiMap },
];

const TOPIC_IDEAS = [
  "Photosynthesis",
  "Newton's laws of motion",
  "Binary search trees",
  "SQL joins",
  "World War II causes",
  "Derivatives in calculus",
];

const TUTOR_STARTERS = [
  "Explain recursion like I'm a beginner",
  "What's the difference between mitosis and meiosis?",
  "Help me understand Big-O notation with examples",
  "How do I make a study timetable for exams?",
];

// Quick modifiers appended to the student's question.
const TUTOR_MODES = [
  { label: "Explain simply", suffix: "Explain it simply, like I'm new to this." },
  { label: "Give an example", suffix: "Give me a concrete real-world example." },
  { label: "Step by step", suffix: "Break it down step by step." },
  { label: "Quiz me", suffix: "Then ask me 2 short questions to check I understood." },
];

const card = "bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-lg shadow-zinc-900/50";
const input =
  "w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none";
const primaryBtn =
  "flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-xs font-semibold rounded-xl transition active:scale-95";

function Chips({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPick(t)}
          className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 transition"
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function ErrorNote({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>
  );
}

function readChecked(key: string): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

export default function AiSuitePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const activeTab: Tab = TABS.some((t) => t.key === tabParam) ? tabParam! : "tutor";
  const setActiveTab = (t: Tab) => setSearchParams({ tab: t }, { replace: true });

  const { loading, errors, generateRoadmap, generateQuiz, summarizeNotes, askTutor } = useAiSuite();

  // --- Tutor ---
  const [tutorChat, setTutorChat] = useState<TutorMessage[]>([]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorMode, setTutorMode] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [tutorChat, loading.tutor]);

  const sendTutor = async (text: string) => {
    if (!text.trim() || loading.tutor) return;
    const mode = TUTOR_MODES.find((m) => m.label === tutorMode);
    const prompt = mode ? `${text.trim()}\n\n${mode.suffix}` : text.trim();
    const history = tutorChat;
    setTutorChat((prev) => [...prev, { sender: "user", text: text.trim() }]);
    setTutorInput("");
    const result = await askTutor(prompt, history);
    if (result) setTutorChat((prev) => [...prev, { sender: "ai", text: result.reply }]);
  };

  const handleSendTutor = (e: React.FormEvent) => {
    e.preventDefault();
    void sendTutor(tutorInput);
  };

  // --- Quiz ---
  const [quizTopic, setQuizTopic] = useState("");
  const [quizCount, setQuizCount] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const startQuiz = async (topic: string) => {
    if (!topic.trim()) return;
    setActiveTab("quiz");
    setQuizTopic(topic);
    setSubmitted(false);
    setSelectedAnswers({});
    setQuizQuestions([]);
    const result = await generateQuiz(topic.trim(), quizCount, difficulty);
    if (result) setQuizQuestions(result.questions);
  };

  const quizScore = quizQuestions.filter((q) => selectedAnswers[q.id] === q.correct).length;
  const wrongIds = quizQuestions.filter((q) => selectedAnswers[q.id] !== q.correct).map((q) => q.id);

  const retryWrong = () => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      wrongIds.forEach((id) => delete next[id]);
      return next;
    });
    setSubmitted(false);
  };

  // --- Summarizer ---
  const [notesInput, setNotesInput] = useState("");
  const [summaryResult, setSummaryResult] = useState<NotesSummary | null>(null);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const handleGenerateSummary = async () => {
    if (!notesInput.trim()) return;
    setFlipped({});
    const result = await summarizeNotes(notesInput.trim());
    if (result) setSummaryResult(result);
  };

  // --- Roadmap ---
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState("30");
  const [roadmapResult, setRoadmapResult] = useState<RoadmapPhase[]>([]);
  const progressKey = `roadmap-progress:${goal.trim().toLowerCase()}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const handleGenerateRoadmap = async () => {
    if (!goal.trim()) return;
    const result = await generateRoadmap(goal.trim(), Number(days));
    if (result) {
      setRoadmapResult(result.phases);
      setChecked(readChecked(progressKey));
    }
  };

  const toggleTopic = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(progressKey, JSON.stringify(next));
      } catch {
        /* progress just won't persist */
      }
      return next;
    });
  };

  const totalTopics = roadmapResult.reduce((n, p) => n + p.topics.length, 0);
  const doneTopics = roadmapResult.reduce(
    (n, p, pi) => n + p.topics.filter((_, ti) => checked[`${pi}-${ti}`]).length,
    0,
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 md:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FiZap className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-zinc-100">AI Study Assistant</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Understand a topic, test yourself, turn notes into flashcards, and plan what to study next.
            </p>
          </div>
          <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full self-start md:self-auto">
            Powered by Gemini · double-check important facts
          </span>
        </div>

        {/* Tab Navigation */}
        <div className={`${card} p-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5`}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition active:scale-95 ${
                activeTab === t.key
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-semibold">
                <t.icon className="w-4 h-4" />
                {t.label}
              </span>
              <span className={`text-[10px] mt-0.5 ${activeTab === t.key ? "text-black/60" : "text-zinc-600"}`}>
                {t.hint}
              </span>
            </button>
          ))}
        </div>

        {/* ========================= TUTOR ========================= */}
        {activeTab === "tutor" && (
          <div className={`${card} flex flex-col h-[600px] max-h-[75vh]`}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <HiOutlineSparkles className="w-4 h-4 text-emerald-400" /> StudyBuddy Tutor
              </p>
              {tutorChat.length > 0 && (
                <button
                  onClick={() => setTutorChat([])}
                  className="text-[11px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1"
                >
                  <FiTrash2 className="w-3 h-3" /> New chat
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {tutorChat.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <div>
                    <p className="text-sm text-zinc-200 font-medium">What are you studying today?</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Ask a doubt, paste a question you're stuck on, or pick a starter.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full">
                    {TUTOR_STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => void sendTutor(s)}
                        className="text-left text-xs p-3 rounded-xl bg-black/40 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tutorChat.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] text-xs px-4 py-3 rounded-2xl ${
                      m.sender === "user"
                        ? "bg-emerald-500 text-black rounded-br-md"
                        : "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 rounded-bl-md"
                    }`}
                  >
                    {m.sender === "ai" ? <Markdown text={m.text} /> : m.text}
                    {m.sender === "ai" && (
                      <button
                        onClick={() => void startQuiz(tutorChat[i - 1]?.text ?? m.text.slice(0, 120))}
                        className="mt-2 text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Practice this with a quiz <FiChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading.tutor && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <ErrorNote error={errors.tutor} />
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendTutor} className="p-4 border-t border-zinc-800 space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {TUTOR_MODES.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setTutorMode(tutorMode === m.label ? null : m.label)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                      tutorMode === m.label
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  placeholder="Ask anything — e.g. why does ice float on water?"
                  className={input}
                />
                <button type="submit" disabled={loading.tutor || !tutorInput.trim()} className={primaryBtn}>
                  <FiSend className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================= QUIZ ========================= */}
        {activeTab === "quiz" && (
          <div className={`${card} p-6 space-y-6`}>
            <div className="space-y-3 pb-4 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100">Practice quiz</h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void startQuiz(quizTopic)}
                  placeholder="Topic or chapter, e.g. Thermodynamics laws"
                  className={`${input} sm:col-span-6`}
                />
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                  className={`${input} sm:col-span-2`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className={`${input} sm:col-span-2`}
                >
                  {[5, 10, 15].map((n) => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => void startQuiz(quizTopic)}
                  disabled={loading.quiz || !quizTopic.trim()}
                  className={`${primaryBtn} sm:col-span-2`}
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${loading.quiz ? "animate-spin" : ""}`} />
                  {loading.quiz ? "Making..." : "Start"}
                </button>
              </div>
              <Chips items={TOPIC_IDEAS} onPick={(t) => void startQuiz(t)} />
            </div>

            <ErrorNote error={errors.quiz} />

            {quizQuestions.length === 0 && !loading.quiz && (
              <p className="text-center text-xs text-zinc-500 py-6">
                Pick a topic to get a quick quiz with explanations for every answer.
              </p>
            )}

            {submitted && quizQuestions.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    You scored {quizScore}/{quizQuestions.length} (
                    {Math.round((quizScore / quizQuestions.length) * 100)}%)
                  </p>
                  <p className="text-xs text-zinc-400">
                    {quizScore === quizQuestions.length
                      ? "Perfect! Try a harder level next."
                      : "Read the explanations below, then retry the ones you missed."}
                  </p>
                </div>
                <div className="flex gap-2">
                  {wrongIds.length > 0 && (
                    <button onClick={retryWrong} className="px-3 py-1.5 text-xs rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-1">
                      <FiRotateCw className="w-3 h-3" /> Retry {wrongIds.length} wrong
                    </button>
                  )}
                  <button onClick={() => void startQuiz(quizTopic)} className={primaryBtn}>
                    New quiz
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {quizQuestions.map((q, qIndex) => {
                const selected = selectedAnswers[q.id];
                const answered = selected !== undefined;
                const reveal = submitted && answered;
                return (
                  <div key={q.id} className="space-y-3">
                    <h4 className="text-xs md:text-sm font-medium text-zinc-200">
                      <span className="font-mono text-emerald-400 mr-2">Q{qIndex + 1}.</span>
                      {q.question}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIndex) => {
                        const isSel = selected === optIndex;
                        const isCorrect = q.correct === optIndex;
                        let style = "bg-black/40 border-zinc-800 text-zinc-300 hover:border-zinc-600";
                        if (reveal && isCorrect) style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
                        else if (reveal && isSel) style = "bg-red-500/10 border-red-500/40 text-red-300";
                        else if (isSel) style = "bg-zinc-800 border-zinc-500 text-zinc-100";
                        return (
                          <button
                            key={optIndex}
                            disabled={submitted}
                            onClick={() => setSelectedAnswers((p) => ({ ...p, [q.id]: optIndex }))}
                            className={`text-left text-xs p-3 rounded-xl border transition flex items-center justify-between gap-2 ${style}`}
                          >
                            <span>
                              <span className="font-mono text-zinc-500 mr-2">{String.fromCharCode(65 + optIndex)}</span>
                              {opt}
                            </span>
                            {reveal && isCorrect && <FiCheckCircle className="w-4 h-4 shrink-0" />}
                            {reveal && isSel && !isCorrect && <FiXCircle className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {reveal && q.explanation && (
                      <p className="text-xs text-zinc-400 bg-black/40 border border-zinc-800 rounded-xl p-3">
                        <span className="text-emerald-400 font-medium">Why: </span>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {quizQuestions.length > 0 && !submitted && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {Object.keys(selectedAnswers).length}/{quizQuestions.length} answered
                </span>
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className={primaryBtn}
                >
                  <FiCheckCircle className="w-3.5 h-3.5" /> Check answers
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================= SUMMARIZER ========================= */}
        {activeTab === "summarizer" && (
          <div className="space-y-4">
            <div className={`${card} p-5 space-y-3`}>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Turn notes into revision material</h3>
                <p className="text-xs text-zinc-500">
                  Paste lecture notes, a textbook section or a transcript. You'll get a summary, key points and flashcards.
                </p>
              </div>
              <textarea
                rows={8}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Paste your notes here..."
                className={`${input} resize-y`}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">{notesInput.trim().split(/\s+/).filter(Boolean).length} words</span>
                <button
                  onClick={handleGenerateSummary}
                  disabled={loading.summarize || !notesInput.trim()}
                  className={primaryBtn}
                >
                  <HiOutlineSparkles className="w-4 h-4" />
                  {loading.summarize ? "Summarizing..." : "Summarize & make flashcards"}
                </button>
              </div>
            </div>

            <ErrorNote error={errors.summarize} />

            {summaryResult && (
              <div className="space-y-4">
                <div className={`${card} p-5 space-y-4`}>
                  <div>
                    <p className="text-[10px] font-mono text-emerald-400 uppercase">Summary</p>
                    <p className="text-sm text-zinc-200 mt-1 leading-relaxed">{summaryResult.overview}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Key points</p>
                      <ul className="space-y-1.5">
                        {summaryResult.keyPoints.map((k, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            {k}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">What to do next</p>
                      <ul className="space-y-1.5">
                        {summaryResult.actionItems.map((a, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex gap-2">
                            <FiCheckCircle className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => void startQuiz(`these notes: ${summaryResult.overview}`)}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Quiz me on these notes <FiChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {summaryResult.flashcards && summaryResult.flashcards.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">Flashcards · tap to flip</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {summaryResult.flashcards.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => setFlipped((p) => ({ ...p, [i]: !p[i] }))}
                          className={`min-h-[120px] p-4 rounded-2xl border text-left text-xs transition ${
                            flipped[i]
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                              : "bg-zinc-900/70 border-zinc-800 text-zinc-200 hover:border-zinc-600"
                          }`}
                        >
                          <span className="block text-[10px] font-mono text-zinc-500 mb-2">
                            {flipped[i] ? "ANSWER" : `CARD ${i + 1}`}
                          </span>
                          {flipped[i] ? f.back : f.front}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================= ROADMAP ========================= */}
        {activeTab === "roadmap" && (
          <div className="space-y-4">
            <div className={`${card} p-5 space-y-3`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-7">
                  <label className="text-xs font-medium text-zinc-400 block mb-1">What do you want to learn or prepare for?</label>
                  <input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Crack DSA for placements, JEE Physics revision, Learn React"
                    className={input}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Time available</label>
                  <select value={days} onChange={(e) => setDays(e.target.value)} className={input}>
                    <option value="7">1 week (exam cram)</option>
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleGenerateRoadmap}
                    disabled={loading.roadmap || !goal.trim()}
                    className={`${primaryBtn} w-full`}
                  >
                    <HiOutlineSparkles className="w-4 h-4" />
                    {loading.roadmap ? "Planning..." : "Make plan"}
                  </button>
                </div>
              </div>
              <Chips
                items={["Crack DSA for placements", "Board exam Chemistry revision", "Learn Python from scratch", "GATE CS preparation"]}
                onPick={setGoal}
              />
            </div>

            <ErrorNote error={errors.roadmap} />

            {roadmapResult.length === 0 && !loading.roadmap && (
              <p className="text-center text-xs text-zinc-500 py-6">
                Get a phase-by-phase plan you can tick off as you go.
              </p>
            )}

            {roadmapResult.length > 0 && (
              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-300">Your progress</span>
                  <span className="font-mono text-emerald-400">
                    {doneTopics}/{totalTopics} topics
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${totalTopics ? (doneTopics / totalTopics) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {roadmapResult.map((phase, pi) => (
                <div key={pi} className={`${card} p-5 hover:border-zinc-700 transition`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">{phase.phase}</h3>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                      PHASE {pi + 1}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {phase.topics.map((t, ti) => {
                      const key = `${pi}-${ti}`;
                      return (
                        <li key={ti} className="flex items-center justify-between gap-2 group">
                          <label className="flex items-center gap-2.5 text-xs cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={!!checked[key]}
                              onChange={() => toggleTopic(key)}
                              className="accent-emerald-500"
                            />
                            <span className={checked[key] ? "line-through text-zinc-600" : "text-zinc-300"}>{t}</span>
                          </label>
                          <button
                            onClick={() => void startQuiz(t)}
                            className="text-[10px] text-zinc-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                          >
                            Quiz me
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-zinc-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-zinc-400 text-[11px]">
                      🎯 Practice task: <strong className="text-zinc-200">{phase.project}</strong>
                    </span>
                    <Link to="/search" className="text-emerald-400 hover:underline text-[11px] font-medium flex items-center gap-1 shrink-0">
                      Find a study partner <FiChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
