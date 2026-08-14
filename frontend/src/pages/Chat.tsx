import React, { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiSearch,
  FiMoreVertical,
  FiCheck,
  FiPhone,
  FiVideo,
  FiInfo,
  FiCalendar,
  FiPaperclip,
  FiSmile,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

// --- Types ---
interface UserProfile {
  id: string;
  name: string;
  avatarText: string;
  isOnline: boolean;
  learningSkill: string;
  teachingSkill: string;
  bio: string;
}

interface ChatPreview {
  id: string;
  user: UserProfile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: "me" | string;
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

// --- Mock Initial Data ---
const MOCK_CONVERSATIONS: ChatPreview[] = [
  {
    id: "conv-1",
    user: {
      id: "usr-101",
      name: "Sarah Jenkins",
      avatarText: "SJ",
      isOnline: true,
      teachingSkill: "FastAPI & Python",
      learningSkill: "React & Tailwind",
      bio: "Full-stack enthusiast prepping for system design interviews.",
    },
    lastMessage: "Let’s sync up on the WebSocket connection tomorrow!",
    lastMessageTime: "10:42 AM",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    user: {
      id: "usr-102",
      name: "Alex Chen",
      avatarText: "AC",
      isOnline: false,
      teachingSkill: "Data Structures",
      learningSkill: "Supabase & SQL",
      bio: "CS sophomore looking for peer mock interviews.",
    },
    lastMessage: "Thanks for sharing the quiz roadmap link.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "conv-3",
    user: {
      id: "usr-103",
      name: "Priya Sharma",
      avatarText: "PS",
      isOnline: true,
      teachingSkill: "UI/UX Design",
      learningSkill: "Next.js App Router",
      bio: "Product designer diving deep into frontend development.",
    },
    lastMessage: "Do you want to book a study slot for Saturday?",
    lastMessageTime: "Aug 13",
    unreadCount: 0,
  },
];

const MOCK_MESSAGES_MAP: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "m1",
      senderId: "usr-101",
      text: "Hey! I reviewed your FastAPI schema draft for the study sessions.",
      timestamp: "10:30 AM",
      status: "read",
    },
    {
      id: "m2",
      senderId: "me",
      text: "Awesome! Did the JWT auth flow look straightforward?",
      timestamp: "10:35 AM",
      status: "read",
    },
    {
      id: "m3",
      senderId: "usr-101",
      text: "Yes, but we should make sure refresh tokens are securely rotated.",
      timestamp: "10:39 AM",
      status: "read",
    },
    {
      id: "m4",
      senderId: "usr-101",
      text: "Let’s sync up on the WebSocket connection tomorrow!",
      timestamp: "10:42 AM",
      status: "read",
    },
  ],
};

export default function ChatPage() {
  const [conversations, setConversations] =
    useState<ChatPreview[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showInfoSidebar, setShowInfoSidebar] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>(
    MOCK_MESSAGES_MAP["conv-1"] || [],
  );
  const [inputMessage, setInputMessage] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find((c) => c.id === activeConvId);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (MOCK_MESSAGES_MAP[activeConvId]) {
      setMessages(MOCK_MESSAGES_MAP[activeConvId]);
    } else {
      setMessages([]);
    }
    scrollToBottom();
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update preview list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConvId
          ? {
              ...conv,
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.timestamp,
              unreadCount: 0,
            }
          : conv,
      ),
    );

    setInputMessage("");
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.teachingSkill.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col p-4 md:p-6 lg:p-8">
      {/* Outer Shell */}
      <div className="w-full max-w-7xl mx-auto h-[88vh] grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* ========================================================= */}
        {/* 1. LEFT PANEL: Conversations Sidebar (4 cols)              */}
        {/* ========================================================= */}
        <div className="md:col-span-4 flex flex-col bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-lg shadow-zinc-900/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Messages</h2>
              <p className="text-xs text-zinc-400">Study buddy discussions</p>
            </div>
            <span className="font-mono text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/50 px-2.5 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-3 py-2 focus-within:border-zinc-700 transition">
              <FiSearch className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search buddies or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 border ${
                    isActive
                      ? "bg-zinc-800/90 border-zinc-700 text-zinc-100 shadow-sm"
                      : "border-transparent hover:bg-zinc-900/80 hover:border-zinc-800 text-zinc-300"
                  }`}
                >
                  {/* User Avatar with Presence Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-medium text-sm text-zinc-200">
                      {conv.user.avatarText}
                    </div>
                    {conv.user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900 animate-pulse" />
                    )}
                  </div>

                  {/* Conversation Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold truncate text-zinc-100">
                        {conv.user.name}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>

                    {/* Skill tag & Unread Badge */}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                        {conv.user.teachingSkill}
                      </span>

                      {conv.unreadCount > 0 && (
                        <span className="bg-emerald-500 text-black font-semibold text-[10px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MAIN PANEL: Active Chat Thread (8 or 5 cols)            */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-lg shadow-zinc-900/50 overflow-hidden ${
            showInfoSidebar ? "md:col-span-5" : "md:col-span-8"
          }`}
        >
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-medium text-sm text-zinc-100">
                      {activeChat.user.avatarText}
                    </div>
                    {activeChat.user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
                      {activeChat.user.name}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                      <span
                        className={
                          activeChat.user.isOnline
                            ? "text-emerald-400"
                            : "text-zinc-500"
                        }
                      >
                        {activeChat.user.isOnline ? "● Online" : "○ Offline"}
                      </span>
                      <span>• ID: #{activeChat.user.id}</span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <button
                    aria-label="Video Call"
                    className="p-2 rounded-xl hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 transition active:scale-95"
                  >
                    <FiVideo className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Voice Call"
                    className="p-2 rounded-xl hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 transition active:scale-95"
                  >
                    <FiPhone className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Toggle Buddy Info"
                    onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                    className={`p-2 rounded-xl transition active:scale-95 border ${
                      showInfoSidebar
                        ? "text-emerald-400 bg-zinc-800 border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border-transparent hover:border-zinc-700"
                    }`}
                  >
                    <FiInfo className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {/* Notice Pill */}
                <div className="flex justify-center my-2">
                  <div className="font-mono text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                    End-to-end peer study session active
                  </div>
                </div>

                {messages.map((msg) => {
                  const isMe = msg.senderId === "me";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl p-3.5 transition-all duration-150 ${
                          isMe
                            ? "bg-emerald-500 text-black font-medium rounded-br-xs shadow-md shadow-emerald-950/20"
                            : "bg-zinc-900/90 border border-zinc-800/90 text-zinc-200 rounded-bl-xs"
                        }`}
                      >
                        <p className="text-xs md:text-sm leading-relaxed">
                          {msg.text}
                        </p>

                        <div
                          className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end font-mono ${
                            isMe ? "text-black/70" : "text-zinc-500"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isMe && (
                            <span className="flex items-center -space-x-1">
                              <FiCheck className="w-3 h-3 text-black/80" />
                              <FiCheck className="w-3 h-3 text-black/80" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/40"
              >
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-1.5 focus-within:border-zinc-700 transition">
                  <button
                    type="button"
                    className="p-2 text-zinc-500 hover:text-zinc-300 transition active:scale-95"
                    title="Attach file or code snippet"
                  >
                    <FiPaperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${activeChat.user.name}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-1.5 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    className="p-2 text-zinc-500 hover:text-zinc-300 transition active:scale-95"
                  >
                    <FiSmile className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-black font-semibold transition active:scale-95 shadow-sm"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT PANEL: Buddy Details & Schedule CTA (3 cols)      */}
        {/* ========================================================= */}
        {showInfoSidebar && activeChat && (
          <div className="md:col-span-3 flex flex-col bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-zinc-900/50 space-y-5 animate-in fade-in duration-150">
            {/* Header */}
            <div className="text-center pb-4 border-b border-zinc-800/80">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 mx-auto flex items-center justify-center text-lg font-bold text-zinc-100 mb-2">
                {activeChat.user.avatarText}
              </div>
              <h4 className="text-sm font-semibold text-zinc-100">
                {activeChat.user.name}
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                {activeChat.user.bio}
              </p>
            </div>

            {/* Skill Exchange Details */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Can Teach
                </span>
                <div className="mt-1 font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                  {activeChat.user.teachingSkill}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Wants to Learn
                </span>
                <div className="mt-1 font-mono text-xs text-zinc-300 bg-zinc-800/60 border border-zinc-700/50 px-2.5 py-1 rounded-xl">
                  {activeChat.user.learningSkill}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition active:scale-95 shadow-sm">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>Schedule Study Session</span>
              </button>

              <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 font-medium text-xs transition active:scale-95">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generate Shared Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
