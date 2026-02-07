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
    const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const res = await fetch("/api/tasks");
        if (res.ok) {
            const data = await res.json();
            setColumns(data);
        }
        setLoading(false);
    }

    async function createTask(columnId: string) {
        if (!newTaskTitle.trim()) return;
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ columnId, title: newTaskTitle }),
        });
        if (res.ok) {
            setNewTaskTitle("");
            setNewTaskColumn(null);
            fetchData();
        }
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
        setDraggingTask(task);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    function handleDrop(columnId: string) {
        if (draggingTask && draggingTask.columnId !== columnId) {
            moveTask(draggingTask.id, columnId);
        }
        setDraggingTask(null);
    }

    const priorityColors: Record<string, string> = {
        high: "bg-red-500/20 text-red-400 border-red-500/50",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        low: "bg-green-500/20 text-green-400 border-green-500/50",
    };

    if (loading) {
        return <div className="text-center text-gray-400 py-8">Loading task board...</div>;
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
                <div
                    key={column.id}
                    className="flex-shrink-0 w-80 bg-vex-darker rounded-xl p-4 border border-vex-dark"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(column.id)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">{column.name}</h3>
                        <span className="text-xs text-gray-500 bg-vex-dark px-2 py-1 rounded-full">
                            {column.tasks.length}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {column.tasks.map((task) => (
                            <div
                                key={task.id}
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                className="bg-vex-bg rounded-lg p-3 border border-vex-dark hover:border-vex-accent cursor-grab active:cursor-grabbing transition-colors group"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-white text-sm">{task.title}</h4>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {task.description && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                    {task.tags.map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-vex-dark text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                {task.subtasks.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        ☑ {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                                    </div>
                                )}
                                {task.assignees.length > 0 && (
                                    <div className="mt-2 flex -space-x-2">
                                        {task.assignees.slice(0, 3).map((a, i) => (
                                            <div
                                                key={i}
                                                className="w-6 h-6 rounded-full bg-vex-accent text-white text-xs flex items-center justify-center border-2 border-vex-bg"
                                                title={a}
                                            >
                                                {a[0]?.toUpperCase()}
                                            </div>
                                        ))}
                                        {task.assignees.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-vex-dark text-gray-400 text-xs flex items-center justify-center border-2 border-vex-bg">
                                                +{task.assignees.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add Task */}
                        {newTaskColumn === column.id ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Task title..."
                                    className="input w-full text-sm"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && createTask(column.id)}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => createTask(column.id)}
                                        className="btn-primary text-sm py-1"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewTaskColumn(null);
                                            setNewTaskTitle("");
                                        }}
                                        className="btn-secondary text-sm py-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setNewTaskColumn(column.id)}
                                className="w-full text-left text-sm text-gray-500 hover:text-white py-2 px-3 rounded-lg hover:bg-vex-dark/50 transition-colors"
                            >
                                + Add task
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
