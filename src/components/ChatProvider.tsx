"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Team = { id: string; teamNumber: string };

type ChatContextType = {
  isChatOpen: boolean;
  toggleChat: () => void;
  selectedTeam: Team | null;
  openChatWith: (team: Team) => void;
  unreadByTeam: Record<string, number>;
  totalUnread: number;
  connectedTeams: Team[];
  currentTeamId: string;
  markTeamRead: (teamId: string) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}

// localStorage keys so chat state survives page refreshes
const CHAT_OPEN_KEY = "sparkvex_chat_open";
const CHAT_TEAM_KEY = "sparkvex_chat_team";

/**
 * ==========================================
 * GLOBAL CHAT STATE (THE DM SYSTEM)
 * ==========================================
 * Keeps track of who we're talking to and if they left us on read lol.
 * This polling setup is kinda jank but we didn't want to mess with WebSockets
 * right now tbh, iykyk. 
 * 
 * LocalStorage persists everything so if you hit refresh during a heated strategy
 * convo, you don't lose the tab.
 */
export function ChatProvider({
  children,
  currentTeamId,
  connectedTeams,
}: {
  children: ReactNode;
  currentTeamId: string;
  connectedTeams: Team[];
}) {
  // pull saved state from localStorage
  const [isChatOpen, setIsChatOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CHAT_OPEN_KEY) === "true";
  });

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(CHAT_TEAM_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [unreadByTeam, setUnreadByTeam] = useState<Record<string, number>>({});

  // save open/close to localStorage
  useEffect(() => {
    localStorage.setItem(CHAT_OPEN_KEY, String(isChatOpen));
  }, [isChatOpen]);

  // save which team we're chatting with
  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem(CHAT_TEAM_KEY, JSON.stringify(selectedTeam));
    } else {
      localStorage.removeItem(CHAT_TEAM_KEY);
    }
  }, [selectedTeam]);

  // check for new messages every few seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread-per-team");
        if (res.ok) {
          const data = await res.json();
          setUnreadByTeam(data.unreadByTeam || {});
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 8000);
    return () => clearInterval(interval);
  }, []);

  const totalUnread = Object.values(unreadByTeam).reduce((a, b) => a + b, 0);

  // update the browser tab to show unread count
  useEffect(() => {
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) SparkVEX`;
    } else {
      document.title = "SparkVEX";
    }
  }, [totalUnread]);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const openChatWith = useCallback((team: Team) => {
    setSelectedTeam(team);
    setIsChatOpen(true);
  }, []);

  // clear unread count when you open a conversation
  const markTeamRead = useCallback((teamId: string) => {
    setUnreadByTeam((prev) => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        toggleChat,
        selectedTeam,
        openChatWith,
        unreadByTeam,
        totalUnread,
        connectedTeams,
        currentTeamId,
        markTeamRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
