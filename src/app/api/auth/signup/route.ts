import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  teamNumber: z.string().min(1),
  provinceState: z.string().optional(),
  country: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password, teamNumber, provinceState, country } = parsed.data;

    const existingTeam = await prisma.team.findUnique({ where: { teamNumber } });
    if (existingTeam) {
      const hasUser = await prisma.user.findUnique({ where: { teamId: existingTeam.id } });
      if (hasUser) {
        return NextResponse.json({ error: "Team number already has an account" }, { status: 409 });
      }
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await hash(password, 12);
    const team = existingTeam ?? await prisma.team.create({
      data: {
        teamNumber,
        provinceState: provinceState ?? null,
        country: country ?? null,
      },
    });
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        teamId: team.id,
      },
    });
    return NextResponse.json({ ok: true, userId: user.id, teamId: team.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
