"use client";

import { useState, useEffect, useRef } from "react";
import { useChatContext } from "./ChatProvider";

type Message = {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  content: string;
  createdAt: string;
  fromTeam: { teamNumber: string };
};

// 12-hour format so timestamps look normal
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function GlobalChatPanel() {
  const {
    isChatOpen,
    toggleChat,
    selectedTeam,
    openChatWith,
    connectedTeams,
    currentTeamId,
    unreadByTeam,
    markTeamRead,
  } = useChatContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // load messages when you click on a team
  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?withTeamId=${selectedTeam.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
          // we're looking at this convo so it's read now
          markTeamRead(selectedTeam.id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedTeam?.id]);

  // auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeam) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toTeamId: selectedTeam.id,
          content: newMessage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const goBackToList = () => {
    // go back to the team list (for mobile)
    openChatWith(null as any);
  };

  if (!isChatOpen) return null;

  return (
    <>
      {/* mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[58] md:hidden"
        onClick={toggleChat}
      />

      {/* panel */}
      <div className="fixed top-0 right-0 h-full z-[59] flex flex-col bg-surface-bg border-l border-line shadow-[0_0_60px_rgba(0,0,0,0.5)] w-full md:w-[38%] md:min-w-[360px] md:max-w-[520px]">
        {/* header */}
        <div className="h-14 bg-surface-card border-b border-line flex items-center justify-between px-4 flex-shrink-0">
          {selectedTeam ? (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={goBackToList}
                  className="text-txt-3 hover:text-txt-1 transition-colors text-sm md:hidden"
                >
                  ←
                </button>
                <h3 className="font-mono font-bold text-sm text-txt-1">
                  Team {selectedTeam.teamNumber}
                </h3>
              </div>
            </>
          ) : (
            <h3 className="font-mono font-bold text-sm text-txt-1 tracking-widest uppercase">
              Messages
            </h3>
          )}
          <button
            onClick={toggleChat}
            className="text-txt-3 hover:text-txt-1 text-xl leading-none px-2"
          >
            &times;
          </button>
        </div>

        {/* body - either team list or conversation */}
        {!selectedTeam ? (
          // team list
          <div className="flex-1 overflow-y-auto">
            {connectedTeams.length === 0 ? (
              <div className="flex items-center justify-center h-full px-6">
                <p className="text-sm text-txt-3 text-center font-mono">
                  No connected teams yet. Connect with teams to start messaging.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {connectedTeams.map((team) => {
                  const unread = unreadByTeam[team.id] || 0;
                  return (
                    <button
                      key={team.id}
                      onClick={() => openChatWith(team)}
                      className="flex items-center justify-between px-5 py-4 border-b border-line hover:bg-surface-hover transition-colors text-left"
                    >
                      <div>
                        <span className="font-mono font-bold text-sm text-txt-1">
                          Team {team.teamNumber}
                        </span>
                      </div>
                      {unread > 0 && (
                        <span className="min-w-[20px] h-5 rounded-full bg-[#EF4444] text-white text-[10px] font-mono font-bold flex items-center justify-center px-1.5">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // conversation view
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface-bg/50">
              {loading ? (
                <p className="text-xs font-mono text-txt-3 text-center py-8 uppercase tracking-widest">
                  Loading...
                </p>
              ) : messages.length === 0 ? (
                // empty chat state
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="font-mono font-bold text-sm text-txt-2">
                    Team {selectedTeam.teamNumber}
                  </p>
                  <p className="text-sm text-txt-3">
                    Say hi to Team {selectedTeam.teamNumber}!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.fromTeamId === currentTeamId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2 max-w-[85%] text-sm shadow-sm ${
                          isMe
                            ? "bg-red-500/20 text-red-50 border border-red-500/30 rounded-2xl rounded-br-sm"
                            : "bg-surface-card text-txt-2 border border-line rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-txt-3 mt-1.5 font-mono">
                        {formatTime(m.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* message input */}
            <form
              onSubmit={sendMessage}
              className="p-3 bg-surface-card border-t border-line flex gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-surface-bg border border-line rounded-lg text-sm focus:outline-none focus:border-txt-3 transition-colors text-txt-1"
              />
              <button
                type="submit"
                className="btn-primary text-xs !px-4"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
