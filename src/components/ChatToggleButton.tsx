"use client";

import { useChatContext } from "./ChatProvider";

export function ChatToggleButton() {
  const { isChatOpen, toggleChat, totalUnread } = useChatContext();

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-[55] w-12 h-12 bg-surface-card border border-line hover:border-line-hi rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all hover:bg-surface-hover group"
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
    >
      {/* simple chat icon svg */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-txt-2 group-hover:text-txt-1 transition-colors"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {/* unread badge - static red dot */}
      {!isChatOpen && totalUnread > 0 && (
        <span
          className="absolute block rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: "#EF4444",
            top: -4,
            right: -4,
          }}
        />
      )}
    </button>
  );
}
