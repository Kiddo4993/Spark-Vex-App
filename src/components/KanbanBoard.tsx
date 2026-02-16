"use client";

import { useState, useEffect } from "react";

type Subtask = {
    id: string;
    title: string;
    completed: boolean;
};

type TaskComment = {
    id: string;
    author: string;
    content: string;
    createdAt: string;
};

type Task = {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    dueDate: string | null;
    order: number;
    columnId: string;
    assignees: string[];
    tags: string[];
    subtasks: Subtask[];
    comments: TaskComment[];
};

type Column = {
    id: string;
    name: string;
    order: number;
    tasks: Task[];
};

export function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [activeCol, setActiveCol] = useState<string | null>(null);
    const [dragging, setDragging] = useState<Task | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setColumns(data.columns ?? []);
        setLoading(false);
    }

    async function createTask(columnId: string) {
        if (!newTitle.trim()) return;
        await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, columnId }),
        });
        setNewTitle("");
        setActiveCol(null);
        fetchData();
    }

    async function moveTask(taskId: string, newColumnId: string) {
        await fetch("/api/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, columnId: newColumnId }),
        });
        fetchData();
    }

    async function deleteTask(taskId: string) {
        await fetch(`/api/tasks?taskId=${taskId}`, { method: "DELETE" });
        fetchData();
    }

    function handleDragStart(task: Task) {
        setDragging(task);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    function handleDrop(columnId: string) {
        if (dragging && dragging.columnId !== columnId) {
            moveTask(dragging.id, columnId);
        }
        setDragging(null);
    }

    function prioClass(priority: string) {
        if (priority === "high") return "prio-high";
        if (priority === "medium") return "prio-med";
        return "prio-low";
    }

    if (loading) return <p className="text-sm text-txt-3 py-8 text-center">Loading tasks…</p>;

    return (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
            {columns
                .sort((a, b) => a.order - b.order)
                .map((col) => (
                    <div
                        key={col.id}
                        className="task-col"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(col.id)}
                    >
                        {/* Column header */}
                        <div className="px-3.5 py-3 border-b border-line flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-head text-[13px] font-bold text-txt-1">{col.name}</span>
                                <span className="text-[10px] font-mono bg-line text-txt-3 px-1.5 py-0.5 rounded-full">
                                    {col.tasks.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveCol(activeCol === col.id ? null : col.id)}
                                className="text-txt-3 hover:text-spark transition-colors text-lg leading-none"
                            >
                                +
                            </button>
                        </div>

                        {/* Task add form */}
                        {activeCol === col.id && (
                            <div className="p-3 border-b border-line">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && createTask(col.id)}
                                    className="input text-xs"
                                    placeholder="Task title…"
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => createTask(col.id)}
                                        className="btn-primary text-[11px] px-2 py-1"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => { setActiveCol(null); setNewTitle(""); }}
                                        className="btn-ghost text-[11px] px-2 py-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tasks */}
                        <div className="p-2.5 space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: 500 }}>
                            {col.tasks
                                .sort((a, b) => a.order - b.order)
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={() => handleDragStart(task)}
                                        className="task-item"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <span className="text-[12.5px] text-txt-1 font-medium leading-tight">{task.title}</span>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="text-txt-3 hover:text-danger text-xs flex-shrink-0 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {task.description && (
                                            <p className="text-[11px] text-txt-3 mb-2 line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`task-priority ${prioClass(task.priority)}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                            {task.tags.map((tag) => (
                                                <span key={tag} className="ext-chip text-[9px]">{tag}</span>
                                            ))}
                                        </div>
                                        {task.subtasks.length > 0 && (
                                            <div className="mt-2 text-[10px] font-mono text-txt-3">
                                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} done
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
        </div>
    );
}
