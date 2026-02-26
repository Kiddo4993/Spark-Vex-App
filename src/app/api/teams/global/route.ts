import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    // Ensure the user is logged in
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    if (search.length < 1) {
        return NextResponse.json([]);
    }

    try {
        const teams = await prisma.team.findMany({
            where: {
                AND: [
                    { teamNumber: { not: "ADMIN" } },
                    {
                        OR: [
                            { teamNumber: { contains: search, mode: "insensitive" } },
                            { provinceState: { contains: search, mode: "insensitive" } },
                            { country: { contains: search, mode: "insensitive" } },
                        ],
                    },
                ],
            },
            take: 50, // Limit to 50 results parsing globally
        });

        return NextResponse.json(teams);
    } catch (error) {
        console.error("Global search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
