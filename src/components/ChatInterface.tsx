"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
    id: string;
    fromTeamId: string;
    toTeamId: string;
    content: string;
    createdAt: string;
    fromTeam: { teamNumber: string };
};

export function ChatInterface({
    currentTeamId,
    otherTeam,
    onClose,
}: {
    currentTeamId: string;
    otherTeam: { id: string; teamNumber: string };
    onClose: () => void;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages?withTeamId=${otherTeam.id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // poll every 5s
        return () => clearInterval(interval);
    }, [otherTeam.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toTeamId: otherTeam.id,
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

    return (
        <div className="fixed bottom-0 right-4 w-80 md:w-96 bg-surface-bg border border-line rounded-t-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col z-50 animate-fade-in">
            <div className="p-3 bg-surface-card border-b border-line flex justify-between items-center rounded-t-xl">
                <h3 className="font-mono font-bold text-sm text-txt-1">Chat - Team {otherTeam.teamNumber}</h3>
                <button onClick={onClose} className="text-txt-3 hover:text-txt-1 text-xl leading-none px-2 mb-1">&times;</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto h-[400px] space-y-4 bg-surface-bg/50">
                {loading ? (
                    <p className="text-xs font-mono text-txt-3 text-center py-4 uppercase tracking-widest">Loading...</p>
                ) : messages.length === 0 ? (
                    <p className="text-xs font-mono text-txt-3 text-center py-4 uppercase tracking-widest">No messages yet. Say hi!</p>
                ) : (
                    messages.map((m) => {
                        const isMe = m.fromTeamId === currentTeamId;
                        return (
                            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                <div className={`px-4 py-2 max-w-[85%] text-sm shadow-sm ${isMe ? "bg-red-500/20 text-red-50 border border-red-500/30 rounded-2xl rounded-br-sm" : "bg-surface-card text-txt-2 border border-line rounded-2xl rounded-bl-sm"}`}>
                                    {m.content}
                                </div>
                                <span className="text-[9px] text-txt-3 mt-1.5 font-mono">
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-3 bg-surface-card border-t border-line flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-surface-bg border border-line rounded-lg text-sm focus:outline-none focus:border-txt-3 transition-colors text-txt-1"
                />
                <button type="submit" className="btn-primary text-xs !px-4" disabled={!newMessage.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
}
