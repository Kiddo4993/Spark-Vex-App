import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const withTeamId = searchParams.get("withTeamId");

    if (!withTeamId) {
        return NextResponse.json({ error: "Missing withTeamId parameter" }, { status: 400 });
    }

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { fromTeamId: session.user.teamId, toTeamId: withTeamId },
                    { fromTeamId: withTeamId, toTeamId: session.user.teamId },
                ],
            },
            orderBy: { createdAt: "asc" },
            include: {
                fromTeam: { select: { teamNumber: true } },
            },
        });

        // Mark unread messages from the other team as read
        await prisma.message.updateMany({
            where: {
                fromTeamId: withTeamId,
                toTeamId: session.user.teamId,
                read: false,
            },
            data: { read: true },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { toTeamId, content } = await req.json();

        if (!toTeamId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Optional: Verify that a connection exists between the two teams
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { fromTeamId: session.user.teamId, toTeamId },
                    { fromTeamId: toTeamId, toTeamId: session.user.teamId }
                ],
                status: "accepted"
            }
        });

        if (!connection) {
            return NextResponse.json({ error: "You can only message connected teams" }, { status: 403 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                fromTeamId: session.user.teamId,
                toTeamId,
            },
            include: {
                fromTeam: { select: { teamNumber: true } },
            }
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error("Failed to send message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
