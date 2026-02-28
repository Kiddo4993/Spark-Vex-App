# SparkVEX — Bayesian Alliance Engine

> **Data-driven alliance selection for VEX Robotics.**  
> Import match data, track Bayesian performance ratings, scout opponents, and find your ideal alliance partner—all in one platform.

**Live Site:** [spark-vex-app.vercel.app](https://spark-vex-app.vercel.app)  
**Team:** 77174A Holy Airball!  
**Author:** Dylan Duan  
**License:** MIT

---

## Table of Contents

1. [The Idea](#the-idea)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Database Design](#database-design)
5. [The Bayesian Performance Model](#the-bayesian-performance-model)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Deployment](#deployment)
9. [License](#license)

---

## The Idea

Traditional VEX Robotics alliance selection relies on gut feeling and simple win/loss records. **SparkVEX** solves this by introducing a **custom Bayesian Performance Model** that statistically isolates each team's individual contribution from alliance match results.

Instead of just asking *"Did the alliance win?"*, our model asks:
- *Who* were the teammates?
- *Who* was the opponent?
- *How much* did each team likely contribute?

The result is a **performance rating** and **confidence interval** for every team—giving you a data-backed edge during alliance selection.

---

## Key Features

| Feature | Description |
|---|---|
| **Bayesian Rating Engine** | Custom statistical model that rates teams based on match performance, opponent strength, and alliance partner contribution. Each team gets a performance rating + uncertainty score. |
| **Tournament Import** | Upload `.xls` / `.xlsx` / `.csv` files exported from VEX Tournament Manager. The system auto-parses match data and creates/updates team records. |
| **Alliance Selection Table** | Ranks all imported teams by Bayesian performance rating with confidence scores, autonomous compatibility flags, and re-scout warnings. |
| **Team Profiles** | Detailed profiles for each team: drivetrain type, autonomous side, auton reliability %, strategy tags, scouting notes, performance history graph, and match-by-match breakdowns. |
| **Scouting System** | Rate any team's auto strength and driver strength on a 0-10 scale with private scouting notes. Data is scoped per viewer team. |
| **Find & Connect** | Search the global database of ~10,000 VEX teams. Send connection requests, accept/deny incoming requests, and build your network. |
| **Direct Messaging** | Real-time chat with connected teams. Unread message indicators with polling. |
| **Team Notes** | Private strategy and scouting notes shared between connected teams. |
| **Kanban Task Board** | Drag-and-drop task management with columns (To Do, In Progress, Done), subtasks, priorities, due dates, tags, and comments. |
| **Admin Panel** | Admin users can manage all teams, view generated passwords, and access system-wide controls. |
| **Walkthrough Guide** | Built-in interactive guide explaining how to use the Bayesian model, import data, and interpret confidence scores. |
| **Skills Rankings** | Worldwide and provincial skills rankings computed from driver, autonomous, and combined skills scores. |
| **Role-Based Access** | Two roles: **Admin** (full management) and **Team** (scoped to own data). Middleware enforces route protection. |
| **Dark Theme** | Premium dark UI with custom color palette, alliance-specific red/blue theming, and modern typography. |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.x | React framework with App Router (SSR + SSG) |
| **React** | 18.x | Component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **TailwindCSS** | 3.4 | Utility-first CSS framework |
| **Google Fonts** | — | Syne (headings), Space Mono (monospace/data), Inter (body) |
| **react-hot-toast** | 2.6 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js API Routes** | 14.x | RESTful API endpoints (App Router `route.ts`) |
| **NextAuth.js** | 4.24 | Authentication (JWT-based, credentials provider) |
| **Prisma ORM** | 5.22 | Database ORM with type-safe queries |
| **bcryptjs** | 2.4 | Password hashing (12 salt rounds) |
| **Zod** | 3.23 | Runtime schema validation |

### Database
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Primary relational database |
| **Neon** | Serverless PostgreSQL hosting (connection pooling) |

### Data Processing
| Technology | Purpose |
|---|---|
| **xlsx** | Parse `.xls` and `.xlsx` spreadsheet files |
| **csv-parse** | Parse `.csv` files |

### Deployment & DevOps
| Technology | Purpose |
|---|---|
| **Vercel** | Hosting and continuous deployment |
| **Git / GitHub** | Version control |
| **ESLint** | Code linting |
| **PostCSS + Autoprefixer** | CSS processing |

---

## Database Design

The database uses **PostgreSQL** (hosted on **Neon**) with **Prisma ORM**. There are **15 models** organized into three domains:

### Core Models

```
User            — Authentication account (email, hashed password, admin flag)
Team            — VEX team profile (team number, drivetrain, auton side, strategy tags, notes)
Match           — Tournament match (event name, date, scores, 6 team slots: 3 red + 3 blue)
TeamMatchStats  — Per-team per-match Bayesian breakdown (rating before/after, credit factor, etc.)
PerformanceHistory — Time-series rating snapshots for trend graphs
CalculatedRating — Cached Bayesian rating per uploader-subject pair
```

### Scouting & Social Models

```
ScoutingData    — Private scouting (auto strength, driver strength, notes) per scouter-subject pair
Connection      — Team-to-team connections (pending / accepted / denied)
Note            — Strategy and scouting notes shared between connected teams
Message         — Direct messages between connected teams (with read tracking)
MatchComment    — Comments on specific matches
```

### Task Board Models

```
TaskColumn      — Kanban columns (To Do, In Progress, Done)
Task            — Individual tasks with priority, due date, assignees, tags
Subtask         — Checklist items within a task
TaskComment     — Discussion comments on tasks
```

### Entity Relationship Overview

```
User ──1:1── Team
Team ──1:N── Match (as uploader)
Team ──M:N── Match (as participant via 6 alliance slots)
Match ──1:N── TeamMatchStats
Team ──1:N── PerformanceHistory
Team ──M:N── CalculatedRating (uploader ↔ subject)
Team ──M:N── ScoutingData (scouter ↔ subject)
Team ──M:N── Connection (from ↔ to)
Team ──M:N── Note (from ↔ to)
Team ──M:N── Message (from ↔ to)
Team ──1:N── TaskColumn ──1:N── Task ──1:N── Subtask
```

---

## The Bayesian Performance Model

The rating engine (`src/lib/bayesian.ts`, 441 lines) implements a custom Bayesian-inspired Elo system specifically designed for 3v3 alliance matches.

### Core Algorithm

1. **Initial State:** Every team starts at **rating = 100** with **uncertainty = 50**.
2. **Alliance Strength:** Teams in an alliance are sorted by rating. A weighted average (70/30 strongest-to-weakest) produces the alliance rating. Alliance uncertainty is computed via variance addition.
3. **Expected Outcome:** Uses the **Normal CDF** to compute win probability: `P(win) = Φ((R_alliance1 - R_alliance2) / combined_uncertainty)`.
4. **Credit Distribution:** Within an alliance, stronger teams receive proportionally more credit/blame. This uses a `botStrength = Rating / Uncertainty` metric.
5. **Rating Update:** `new_rating = old_rating + K × credit × (Actual - Expected)` where K = 32.
6. **Uncertainty Update:** Uncertainty shrinks when the result is expected and grows when it's surprising. Minimum uncertainty floor = 10.
7. **Skills Boost:** Teams with driver skills scores get an initial rating bump: `boost = driverSkillsScore / 5`.
8. **Confidence:** Converted from uncertainty via `confidence = max(0, min(100, 100 × (1 - uncertainty/initial_uncertainty)))`.

### Key Constants

| Constant | Value | Purpose |
|---|---|---|
| `K` | 32 | Rating variance multiplier |
| `W` | 0.7 | Credit weight to stronger team |
| `U_MATCH` | 20 | Global match uncertainty |
| `U_MIN` | 10 | Minimum uncertainty floor |
| `INITIAL_RATING` | 100 | Starting rating |
| `INITIAL_UNCERTAINTY` | 50 | Starting uncertainty |
| `SCOUT_NEEDED_THRESHOLD` | 25 | Re-scout warning threshold |

---

## Project Structure

```
SparksVex/
├── prisma/
│   ├── schema.prisma          # 15 database models
│   ├── migrations/            # Database migration history
│   └── seed.ts                # Seed script with sample teams
├── public/
│   ├── user-guide.md          # User-facing guide
│   └── static_tasks.html      # Static task board template
├── scripts/
│   ├── create-admin.ts        # Admin account creation script
│   ├── generateTournamentData.js  # Sample tournament data generator
│   └── verify-bayesian.ts     # Bayesian engine verification tests
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (hero + feature list + sample leaderboards)
│   │   ├── layout.tsx         # Root layout (fonts, session, toasts)
│   │   ├── globals.css        # Design system (386 lines, 30+ component classes)
│   │   ├── auth/signin/       # Sign-in page
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Dashboard home (stat cards, recent matches, connections)
│   │   │   ├── layout.tsx     # Dashboard layout (sidebar + main content)
│   │   │   ├── admin/         # Admin management panel
│   │   │   ├── alliance-selection/  # Alliance synergy table
│   │   │   ├── connect/       # Find & Connect (global team search)
│   │   │   ├── connections/   # Connection management + messaging
│   │   │   ├── guide/         # Walkthrough guide page
│   │   │   ├── import/        # Tournament file import wizard
│   │   │   ├── matches/       # Match list with filters
│   │   │   ├── notes/         # Team Notes (Kanban board)
│   │   │   └── teams/         # Imported teams list + individual team profiles
│   │   └── api/
│   │       ├── admin/         # Admin endpoints
│   │       ├── alliance-synergy/  # Synergy calculation endpoint
│   │       ├── auth/          # NextAuth handler
│   │       ├── connections/   # Connection CRUD
│   │       ├── import/        # File upload → parse → Bayesian processing
│   │       ├── matches/       # Match CRUD + comments
│   │       ├── messages/      # Direct messaging + unread counts
│   │       ├── notes/         # Team notes CRUD
│   │       ├── skills/        # Skills rankings
│   │       ├── tasks/         # Kanban task board CRUD
│   │       └── teams/         # Team search + profile endpoints
│   ├── components/            # 21 reusable React components
│   │   ├── AddMatchForm.tsx
│   │   ├── AllianceSynergyTable.tsx
│   │   ├── BestMatches.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ColumnMappingTable.tsx
│   │   ├── ConnectedTeams.tsx
│   │   ├── ConnectionsList.tsx
│   │   ├── DashboardCards.tsx
│   │   ├── ImportFileUpload.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── RecentMatches.tsx
│   │   ├── SampleLeaderboards.tsx
│   │   ├── ScoutingForm.tsx
│   │   ├── SearchAndRequest.tsx
│   │   ├── SessionProvider.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SkillsForm.tsx
│   │   ├── TeamAwards.tsx
│   │   ├── TeamProfileCard.tsx
│   │   ├── TeamProfileForm.tsx
│   │   └── TeamsSearch.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── bayesian.ts        # Bayesian Performance Model (441 lines)
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── sampleData.ts      # Sample leaderboard data
│   │   ├── skills.ts          # Skills ranking logic
│   │   ├── skillsData.json    # Pre-loaded skills database (~10K teams)
│   │   └── tournamentData.json # Sample tournament results
│   ├── middleware.ts          # Auth route protection
│   └── types/                 # TypeScript type definitions
├── package.json
├── tailwind.config.ts         # Custom theme (alliance colors, dark surfaces)
├── tsconfig.json
├── next.config.js             # Security headers
├── LICENSE                    # MIT License
└── .env                       # Environment variables (Neon DB, NextAuth, Vercel)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- A **PostgreSQL** database (Neon recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/Kiddo4993/Spark-Vex-App.git
cd Spark-Vex-App

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed sample data
npm run db:seed

# Start development server
npm run dev
```

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start development server |
| `build` | `prisma generate && next build` | Build for production |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint |
| `db:push` | `prisma db push` | Push schema changes to DB |
| `db:seed` | `tsx prisma/seed.ts` | Seed database with sample data |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |

---

## Deployment

SparkVEX is deployed on **Vercel** with automatic CI/CD from GitHub.

- **Database:** Neon serverless PostgreSQL (with connection pooling)
- **Authentication:** JWT sessions via NextAuth.js (30-day expiry)
- **Security Headers:** X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin)
- **Build:** `prisma generate && next build` — Prisma client auto-generates on install via `postinstall` hook

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

```
MIT License
Copyright (c) 2026 Dylan Duan
```

---

<p align="center">
  <strong>Built by 77174A Holy Airball!</strong><br>
  <em>SparkVEX — Bayesian Alliance Engine</em>
</p>
