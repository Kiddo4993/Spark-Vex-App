import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const unreadCount = await prisma.message.count({
            where: {
                toTeamId: session.user.teamId,
                read: false
            }
        });

        return NextResponse.json({ unreadCount });
    } catch (error) {
        console.error("Failed to fetch unread messages count:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
