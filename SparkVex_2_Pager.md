# SparkVEX: Platform Overview & Concept 2-Pager

## 1. What exactly is SparkVEX?

**SparkVEX** is a fully fleshed-out web app built specifically to help VEX Robotics competition teams win tournaments. At its core, it's a mix of an advanced match history tracker, a Bayesian-backed performance (ELO) rating system, a skills leaderboard, and a collaboration hub for teams.

Instead of hunting down scattered spreadsheets or losing your scouting notes on terrible clipboards, teams can use SparkVEX to put all their tournament data in one spot. The coolest part of the platform is definitely the intelligent performance modeling: it calculates a chess-style Expected Score (or ELO) for every single robot, complete with an "uncertainty" adjustment. This means that every time you punch in a match score, the app automatically figures out how "strong" a team actually is and how "confident" we can be in that rating. Picking your alliance partners has never been this data-driven!

**Core Offerings:**
- **Match Tracking & Bayesian Ratings:** Just enter the red vs. blue match outcomes, and the app takes care of the math. It recalculates performance ratings and uncertainty levels behind the scenes based on exactly how tough the opponents were.
- **Deep Team Profiles & Skills:** Keep tabs on what drivetrain a team is running, their preferred autonomous side, how often their auton actually works, their raw driver skills, and custom strategic tags (like "defensive" or "fast auton").
- **Collaboration & Networking:** Send connection requests out to other teams so you can securely share secret strategy, private scouting notes, and thoughts on previous matches.
- **Built-In Task Management:** Every team gets their own private Kanban-style task board to organize their to-do lists, assign tasks to specific builders, and track exactly how the robot build is going.

---

## 2. Setting Up and Actually Using It

We built the platform to make entering data super seamless while keeping the tracking robust and the collaboration easy.

**Getting Started:**
1. **Team Registration:** Every team creates a unique account using their official robotics team number (like "1234A"). This keeps out the trolls and ensures we have an authentic, global registry of teams.
2. **Your Dashboard Overview:** As soon as you log in, you land on your team's dashboard. It shows you your Bayesian rating, your rating confidence meter, and exactly where your skills score sits compared to regional and global competitors.
3. **Tracking Matches & Events:**
   - Pop over to the **Matches** section to record your latest results.
   - Punch in the event name, date, the red/blue alliances (all 3 teams each), and the final match score.
   - The second you hit submit, the app instantly re-evaluates the ELO and confidence levels for all six teams on the field based on who was actually supposed to win.
4. **Scouting & Discovery:** Use the **Search** feature to hunt down your upcoming opponents or try to find a clutch alliance partner. You can look at their win history, how reliable their auton is, and what kind of playstyle they use.
5. **Connecting with Teams:** Hit up the **Connections** tab to become friends with other teams. Once you're connected, you can leave shared strategy notes on specific robots or drop comments on previous matches to help each other out at the next tournament.

---

## 3. Under the Hood: The Code & Structure

SparkVEX is powered by a modern stack: **Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma, and PostgreSQL**. We use NextAuth credentials to make sure every VEX team can securely manage their specific robot's profile.

Here is a quick look at how the tech actually fits together:

### A. The Bayesian Performance Model (Database Schema)
Our PostgreSQL database (which we manage using Prisma) holds all the complex connections between Teams, Matches, Alliances, and Performance histories.

```prisma
// A quick peek at prisma/schema.prisma
model Team {
  id                    String    @id @default(cuid())
  teamNumber            String    @unique // Unique robot team number (e.g. "1234A")
  
  // This is where the Bayesian performance model lives
  performanceRating     Float     @default(100)
  ratingUncertainty     Float     @default(50)
  matchCount            Int       @default(0)
  
  // Custom scouting data 
  provinceState         String?
  drivetrainType        String?
  autonReliabilityPct   Float?
  strategyTags          String[] // Things like ["defensive", "fast auton"]
  
  // All the relations mapped out for matchmaking & task management
  teamMatchStats        TeamMatchStats[]
  taskColumns           TaskColumn[]
}
```

### B. Tracking Matches & The App Router Structure
We heavily rely on the Next.js App router (`src/app/dashboard/...`) to keep our endpoints secure and make the user experience buttery smooth. When you go to add a match, the app automatically pulls all the registered teams from the database so selecting an alliance is super fast.

```tsx
// A little piece of src/app/dashboard/matches/add/page.tsx
import { prisma } from "@/lib/prisma";
import { AddMatchForm } from "@/components/AddMatchForm";
import Link from "next/link";

export default async function AddMatchPage() {
  // Grab all the registered teams and alphabetize them for the match selection form
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
        <p className="page-subtitle">Record a new match result. The Bayesian ratings will update automatically in the background.</p>
      </div>
      <div className="card p-6">
        <AddMatchForm teams={teams} />
      </div>
    </div>
  );
}
```

### C. Advanced Collaboration
Robotics teams shouldn't just exist in silos. The `Connection` and `Note` schemas give the app some actual social-networking features specifically tailored for teams building robots together. Teams can share strategy notes natively without leaving the app!

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

## Wrapping Up
In a nutshell, **SparkVEX** brings real data science and professional collaboration tools directly to high school and collegiate robotics. It completely replaces old-school, subjective pen-and-paper scouting with an intelligent, self-updating Bayesian ranking system, all wrapped up in a blazing fast, gorgeous, and fully secure Next.js web app.
