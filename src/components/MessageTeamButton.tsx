"use client";

import { useChatContext } from "./ChatProvider";

// button that opens chat with a specific team, only shows for connected teams
export function MessageTeamButton({ teamId, teamNumber }: { teamId: string; teamNumber: string }) {
  const { connectedTeams, openChatWith } = useChatContext();

  const isConnected = connectedTeams.some((t) => t.id === teamId);
  if (!isConnected) return null;

  return (
    <button
      onClick={() => openChatWith({ id: teamId, teamNumber })}
      className="btn-ghost text-xs flex items-center gap-1.5"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      Message
    </button>
  );
}
