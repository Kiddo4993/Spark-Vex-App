import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const unreadMessages = await prisma.message.groupBy({
            by: ["fromTeamId"],
            where: {
                toTeamId: session.user.teamId,
                read: false,
            },
            _count: { id: true },
        });

        const unreadByTeam: Record<string, number> = {};
        for (const entry of unreadMessages) {
            unreadByTeam[entry.fromTeamId] = entry._count.id;
        }

        return NextResponse.json({ unreadByTeam });
    } catch (error) {
        console.error("Failed to fetch unread messages per team:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
