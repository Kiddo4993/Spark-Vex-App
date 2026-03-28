// factory reset endpoint - nukes all chat messages
// only use this when you actually want to wipe the slate clean
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const result = await prisma.message.deleteMany({});
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("failed to reset messages:", error);
    return NextResponse.json({ error: "reset failed" }, { status: 500 });
  }
}
