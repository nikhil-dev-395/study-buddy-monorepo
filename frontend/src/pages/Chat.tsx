import React, { useEffect, useRef, useState } from "react";
import {
  FiSend,
  FiSearch,
  FiCheck,
  FiPhone,
  FiVideo,
  FiInfo,
  FiCalendar,
  FiPaperclip,
  FiSmile,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const {
    conversations,
    activePeerId,
    messages,
    loadingConversations,
    error,
    selectConversation,
    sendMessage,
  } = useMessages(userId);

  const [searchQuery, setSearchQuery] = useState("");
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.peer_id === activePeerId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-select the first conversation once the buddy list loads.
  useEffect(() => {
    if (activePeerId === null && conversations.length > 0) {
      selectConversation(conversations[0].peer_id);
    }
  }, [activePeerId, conversations, selectConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    void sendMessage(inputMessage);
    setInputMessage("");
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!userId) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center text-sm">
        Please log in to view your messages.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto h-[88vh] grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* ============================= */}
        {/* 1. LEFT PANEL: Conversations   */}
        {/* ============================= */}
        <div className="md:col-span-4 flex flex-col bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-lg shadow-zinc-900/50 overflow-hidden">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Messages</h2>
              <p className="text-xs text-zinc-400">Study buddy discussions</p>
            </div>
            <span className="font-mono text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/50 px-2.5 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          <div className="p-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-3 py-2 focus-within:border-zinc-700 transition">
              <FiSearch className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search buddies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loadingConversations && conversations.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">Loading conversations...</p>
            )}

            {!loadingConversations && filteredConversations.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6 px-4">
                No conversations yet. Connect with a study buddy to start chatting.
              </p>
            )}

            {filteredConversations.map((conv) => {
              const isActive = conv.peer_id === activePeerId;
              return (
                <button
                  key={conv.peer_id}
                  onClick={() => selectConversation(conv.peer_id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 border ${
                    isActive
                      ? "bg-zinc-800/90 border-zinc-700 text-zinc-100 shadow-sm"
                      : "border-transparent hover:bg-zinc-900/80 hover:border-zinc-800 text-zinc-300"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.avatar_url ? (
                      <img
                        src={conv.avatar_url}
                        alt={conv.name}
                        className="w-11 h-11 rounded-full object-cover border border-zinc-700/60"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-medium text-sm text-zinc-200">
                        {initials(conv.name)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold truncate text-zinc-100">
                        {conv.name}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {conv.last_message ?? "Say hello to start the conversation."}
                    </p>

                    {conv.unread_count > 0 && (
                      <div className="flex items-center justify-end mt-1.5">
                        <span className="bg-emerald-500 text-black font-semibold text-[10px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                          {conv.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================= */}
        {/* 2. MAIN PANEL: Active thread   */}
        {/* ============================= */}
        <div
          className={`flex flex-col bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-lg shadow-zinc-900/50 overflow-hidden ${
            showInfoSidebar ? "md:col-span-5" : "md:col-span-8"
          }`}
        >
          {activeConversation ? (
            <>
              <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  {activeConversation.avatar_url ? (
                    <img
                      src={activeConversation.avatar_url}
                      alt={activeConversation.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center font-medium text-sm text-zinc-100">
                      {initials(activeConversation.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
                      {activeConversation.name}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-400">
                      ID: #{activeConversation.peer_id}
                    </p>
                  </div>
                </div>

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

              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="flex justify-center my-2">
                  <div className="font-mono text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                    End-to-end peer study session active
                  </div>
                </div>

                {messages.map((msg) => {
                  const isMe = msg.sender_id === userId;
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
                        <p className="text-xs md:text-sm leading-relaxed">{msg.content}</p>

                        <div
                          className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end font-mono ${
                            isMe ? "text-black/70" : "text-zinc-500"
                          }`}
                        >
                          <span>{formatTime(msg.created_at)}</span>
                          {isMe && (
                            <span className="flex items-center -space-x-1">
                              <FiCheck className="w-3 h-3 text-black/80" />
                              {msg.is_read && <FiCheck className="w-3 h-3 text-black/80" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

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
                    placeholder={`Message ${activeConversation.name}...`}
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
              {loadingConversations
                ? "Loading conversations..."
                : "Select a conversation to start chatting"}
            </div>
          )}
        </div>

        {/* ============================= */}
        {/* 3. RIGHT PANEL: Buddy details  */}
        {/* ============================= */}
        {showInfoSidebar && activeConversation && (
          <div className="md:col-span-3 flex flex-col bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-zinc-900/50 space-y-5 animate-in fade-in duration-150">
            <div className="text-center pb-4 border-b border-zinc-800/80">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 mx-auto flex items-center justify-center text-lg font-bold text-zinc-100 mb-2 overflow-hidden">
                {activeConversation.avatar_url ? (
                  <img
                    src={activeConversation.avatar_url}
                    alt={activeConversation.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials(activeConversation.name)
                )}
              </div>
              <h4 className="text-sm font-semibold text-zinc-100">
                {activeConversation.name}
              </h4>
            </div>

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

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-2 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
