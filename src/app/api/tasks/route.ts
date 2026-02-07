import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all columns and tasks for the current team
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const teamId = (session.user as { teamId: string }).teamId;

    const columns = await prisma.taskColumn.findMany({
        where: { teamId },
        orderBy: { order: "asc" },
        include: {
            tasks: {
                orderBy: { order: "asc" },
                include: {
                    subtasks: true,
                    comments: { orderBy: { createdAt: "desc" }, take: 5 },
                },
            },
        },
    });

    // If no columns exist, create default ones
    if (columns.length === 0) {
        const defaults = ["To Do", "In Progress", "Review", "Done"];
        const created = await Promise.all(
            defaults.map((name, i) =>
                prisma.taskColumn.create({
                    data: { name, order: i, teamId },
                    include: { tasks: { include: { subtasks: true, comments: true } } },
                })
            )
        );
        return NextResponse.json(created);
    }

    return NextResponse.json(columns);
}

// POST: Create a new task
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { columnId, title, description, priority, dueDate, assignees, tags } = body;

    if (!columnId || !title) {
        return NextResponse.json({ error: "columnId and title required" }, { status: 400 });
    }

    // Get highest order in column
    const maxOrder = await prisma.task.aggregate({
        where: { columnId },
        _max: { order: true },
    });

    const task = await prisma.task.create({
        data: {
            columnId,
            title,
            description: description || null,
            priority: priority || "medium",
            dueDate: dueDate ? new Date(dueDate) : null,
            order: (maxOrder._max.order ?? -1) + 1,
            assignees: assignees || [],
            tags: tags || [],
        },
        include: { subtasks: true, comments: true },
    });

    return NextResponse.json(task, { status: 201 });
}

// PATCH: Update a task (move, edit, etc.)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, columnId, order, title, description, priority, dueDate, assignees, tags } = body;

    if (!taskId) {
        return NextResponse.json({ error: "taskId required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (columnId !== undefined) updateData.columnId = columnId;
    if (order !== undefined) updateData.order = order;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignees !== undefined) updateData.assignees = assignees;
    if (tags !== undefined) updateData.tags = tags;

    const task = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: { subtasks: true, comments: true },
    });

    return NextResponse.json(task);
}

// DELETE: Remove a task
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
        return NextResponse.json({ error: "taskId required" }, { status: 400 });
    }

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true });
}
