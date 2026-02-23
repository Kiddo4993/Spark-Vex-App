# Spark VEX: Platform Overview & Concept 2-Pager

## 1. What is Spark VEX? (The Idea)

**Spark VEX** is a production-ready web application designed specifically for VEX Robotics competition teams. At its core, it serves as an advanced match history tracker, a Bayesian-backed performance (ELO) rating system, a skills leaderboard, and a collaboration hub. 

Rather than relying on scattered spreadsheets and disorganized notes, teams can use Spark VEX to centralize their VEX Robotics competition data. The platform’s standout feature is its intelligent performance modeling—it calculates a chess-style Expected Score (ELO) with uncertainty adjustments for every team. This means that after every match, user-submitted scores are used to automatically refine how "strong" a team is and how "confident" the system is in that rating, making alliance selection and tournament scouting highly data-driven.

**Core Offerings:**
- **Match Tracking & Bayesian Ratings:** Record red vs. blue match outcomes, and the app automatically recalculates performance ratings and uncertainty levels based on opponents' strength.
- **Team Profiles & Skills:** Track drivetrains, autonomous sides, reliability %, driver/autonomous skills, and strategic tags (e.g., "defensive", "fast auton").
- **Collaboration & Networking:** Send connection requests to other teams to securely share strategy, scouting notes, and match comments.
- **Task Management Built-In:** Teams get a built-in Kanban-style task board to manage to-dos, assignees, and robot building/programming progress.

---

## 2. How to Use Spark VEX

The platform is designed around seamless data entry, robust performance tracking, and team collaboration.

**Getting Started:**
1. **Team Registration:** Every team creates a unique account using their official robotics team number (e.g., "1234A"). This ensures an authentic registry of teams competing globally.
2. **Dashboard Overview:** Upon logging in, users are greeted with their team’s dashboard, showing their Bayesian rating, rating confidence meter, and overall skills ranking compared to regional and global peers.
3. **Tracking Matches & Events:**
   - Go to the **Matches** section to record new results.
   - Enter the event name, date, red/blue alliances (3 teams each), and the final match score.
   - As soon as the match is submitted, the application immediately re-evaluates the ELO and confidence levels of all six teams involved based on the match outcome and expected difficulty.
4. **Scouting & Discovery:** Teams can use the **Search** feature to find upcoming opponents or potential alliance partners. They can view a team's win history, autonomous reliability, and playstyle tags. 
5. **Team Workflows:** Use the **Connections** tab to friend other teams. Once connected, allied teams can leave shared notes on specific robots or comment on previous match strategies to assist each other in upcoming tournaments.

---

## 3. Under the Hood: The Code & Structure

Spark VEX is built with a modern stack consisting of **Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, and PostgreSQL**. Authentication is handled by NextAuth credentials, ensuring that every VEX team can securely manage their specific robot's profile.

Here are a few snippets that illustrate the technical architecture of Spark VEX:

### A. The Bayesian Performance Model (Database Schema)
The PostgreSQL database (managed via Prisma) maintains complex relationships between Teams, Matches, Alliances, and Performance histories.

```prisma
// Example from prisma/schema.prisma
model Team {
  id                    String    @id @default(cuid())
  teamNumber            String    @unique // Unique robot team number (e.g. "1234A")
  
  // Bayesian performance model core logic
  performanceRating     Float     @default(100)
  ratingUncertainty     Float     @default(50)
  matchCount            Int       @default(0)
  
  // Scouting data 
  provinceState         String?
  drivetrainType        String?
  autonReliabilityPct   Float?
  strategyTags          String[] // e.g. ["defensive", "fast auton"]
  
  // Relations mapped extensively for matchmaking & task management
  teamMatchStats        TeamMatchStats[]
  taskColumns           TaskColumn[]
}
```

### B. Tracking Matches & The App Router Structure
Spark VEX leverages the Next.js App router (`src/app/dashboard/...`) to secure endpoints and easily transition the user experience. Adding a match requires pulling all teams from the database to select alliances seamlessly.

```tsx
// Example from src/app/dashboard/matches/add/page.tsx
import { prisma } from "@/lib/prisma";
import { AddMatchForm } from "@/components/AddMatchForm";
import Link from "next/link";

export default async function AddMatchPage() {
  // Fetch and alphabetize all registered teams for the match selection form
  const teams = (await prisma.team.findMany({
    orderBy: { teamNumber: "asc" },
    select: { id: true, teamNumber: true },
  })).map((t) => ({
    id: t.id,
    teamNumber: t.teamNumber,
  }));

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/matches" className="text-txt-3 hover:text-txt-1">
          ← Matches
        </Link>
      </div>
      <div>
        <h1 className="page-title">Add Match</h1>
        <p className="page-subtitle">Record a new match result. Bayesian ratings will update automatically.</p>
      </div>
      <div className="card p-6">
        <AddMatchForm teams={teams} />
      </div>
    </div>
  );
}
```

### C. Advanced Collaboration
Teams don't just exist in silos. The `Connection` and `Note` schemas enable social-networking features specifically tailored for robot building alliances. Teams can share strategy notes natively within the application.

```prisma
// Fostering cooperation between Robotics teams
model Note {
  id         String   @id @default(cuid())
  fromTeamId String
  toTeamId   String
  type       String   // "strategy" | "scouting"
  content    String   @db.Text
  fromTeam   Team     @relation("NoteFrom", fields: [fromTeamId], references: [id])
  toTeam     Team     @relation("NoteTo", fields: [toTeamId], references: [id])
}
```

## Summary
In essence, **Spark VEX** brings data science and professional collaboration patterns to high school and collegiate robotics. It replaces subjective, pen-and-paper scouting with an intelligent, updating Bayesian ranking system, bundled into a fast, elegant, and fully secure Next.js web application.
