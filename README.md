# Spark VEX

Production-ready web app for VEX robotics teams: Bayesian performance modelling, alliance selection, skills rankings, and team collaboration.

## Stack

- **Next.js** (App Router), **React**, **TypeScript**, **Tailwind CSS**
- **Prisma** + **PostgreSQL** (Vercel-compatible)
- **NextAuth** (credentials: email + password, one account per team number)
- Deploy on **Vercel**

## Features

- **Auth**: Sign up / sign in with email + password; unique team number required; one account per team; protected dashboard
- **Team profile**: Province/state, country, drivetrain, autonomous side, auton reliability %, strategy tags, notes
- **Skills**: Driver, autonomous, combined scores; provincial and worldwide skills rank (dynamically computed)
- **Matches**: Event name, date, red/blue alliances (2 or 3 teams each), scores; Bayesian ratings updated on add with proper tie handling
- **Bayesian Rating Engine**: Expected outcome via Normal CDF, credit-weighted updates, 70/30 strongest/weakest alliance scoring
- **Uncertainty**: Decreases with consistent results; **expands on regime change** (surprise factor > 0.7) to detect robot upgrades
- **Alliance Selection**: Synergy scoring based on Bayesian rating, autonomous side compatibility, and scouting data. Warns on missing data, auto conflicts, and low confidence.
- **Import**: Upload XLS/CSV files or fetch match data directly from the RobotEvents API
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

- `POST /api/auth/signup` — register (email, password, teamNumber, optional provinceState, country). Skills boost applied at team creation.
- NextAuth: `GET/POST /api/auth/[...nextauth]` — sign in
- `GET/PATCH /api/teams` — get team(s) or update own profile (auth required for PATCH)
- `GET /api/matches` — list matches (public, intentionally accessible for leaderboard)
- `POST /api/matches` — add match (auth required, Bayesian ratings updated with tie support)
- `GET /api/alliance-synergy` — synergy scoring with missing data, auto conflict, and confidence flags
- `GET/POST /api/skills` — skills leaderboard / update own skills (auth for POST)
- `GET/POST /api/connections` — list / send request / accept/deny (auth)
- `GET/POST /api/notes` — shared strategy/scouting notes (auth)
- `GET/POST /api/matches/[id]/comments` — match comments (auth for POST)
- `POST /api/import/parse` — parse uploaded file for import
- `POST /api/import/process` — commit parsed data to DB with Bayesian updates
- `POST /api/import/robotevents` — proxy to RobotEvents API v2

## License

MIT
