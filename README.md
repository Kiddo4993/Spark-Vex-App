# Spark VEX

Production-ready web app for VEX robotics teams: match history, chess-style ELO ratings with uncertainty, skills rankings, and team collaboration.

## Stack

- **Next.js** (App Router), **React**, **TypeScript**, **Tailwind CSS**
- **Prisma** + **PostgreSQL** (Vercel-compatible)
- **NextAuth** (credentials: email + password, one account per team number)
- Deploy on **Vercel**

## Features

- **Auth**: Sign up / sign in with email + password; unique team number required; one account per team; protected dashboard
- **Team profile**: Province/state, country, drivetrain, autonomous side, auton reliability %, notes, strategy tags
- **Skills**: Driver, autonomous, combined scores; provincial and worldwide skills rank (computed)
- **Matches**: Event name, date, red/blue alliances (3 teams each), scores; ELO updated on add
- **ELO**: Chess-style expected score `1 / (1 + 10^((opp - team)/400))`, alliance = average of 3 team ratings, configurable K (default 32)
- **Uncertainty**: `base / sqrt(matchesPlayed)`; confidence meter on dashboard
- **Connections**: Search teams, send/accept/deny requests; connected teams can share strategy/scouting notes and comment on matches

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — PostgreSQL connection string (e.g. Vercel Postgres, Neon)
   - `NEXTAUTH_URL` — e.g. `http://localhost:3000` (use your Vercel URL in production)
   - `NEXTAUTH_SECRET` — random secret, e.g. `openssl rand -base64 32`

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up with a team number or use seed login: **team12345@example.com** / **password123**.

## Vercel deployment

1. Connect the repo to Vercel.
2. Add **Postgres** (or external PostgreSQL) and set `DATABASE_URL`.
3. Add env vars: `NEXTAUTH_URL` (e.g. `https://your-app.vercel.app`), `NEXTAUTH_SECRET`.
4. Deploy. Run migrations (e.g. `npx prisma db push`) from your machine or a one-off script with `DATABASE_URL` set.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run db:push` — push Prisma schema to DB
- `npm run db:seed` — seed example data
- `npm run db:studio` — open Prisma Studio

## API routes

- `POST /api/auth/signup` — register (email, password, teamNumber, optional provinceState, country)
- NextAuth: `GET/POST /api/auth/[...nextauth]` — sign in
- `GET/PATCH /api/teams` — get team(s) or update own profile (auth)
- `GET/POST /api/matches` — list matches or add match (auth for POST)
- `GET /api/elo` — ELO leaderboard or single team
- `GET/POST /api/skills` — skills leaderboard / update own skills (auth for POST)
- `GET/POST /api/connections` — list / send request / accept/deny (auth)
- `GET/POST /api/notes` — shared strategy/scouting notes (auth)
- `GET/POST /api/matches/[id]/comments` — match comments (auth for POST)

## License

MIT
