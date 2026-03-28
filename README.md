# SparkVEX — Bayesian Alliance Engine

> **Data-driven alliance selection for VEX Robotics.**  
> Import match data, track performance ratings, scout opponents, and find your ideal alliance partner.

**Live:** [spark-vex-app.vercel.app](https://spark-vex-app.vercel.app)  
**Team:** 77174A Holy Airball!  
**Author:** Dylan Duan  
**License:** MIT

---

## What is this?

Most VEX teams pick alliance partners based on vibes and win/loss records. We wanted something better, so we built a **Bayesian performance model** that actually tries to figure out how good each individual team is — even though they only play in alliances.

The model looks at who was on each alliance, who they played against, and how much each team probably contributed to the score. Then it spits out a **rating** and a **confidence interval** for every team. We've been using it at our tournaments and it's been pretty nice for alliance selection.

---

## Features

- **Bayesian ratings** — each team gets a performance score + uncertainty. not just "did they win or lose"
- **Tournament import** — upload the .xls from Tournament Manager and it parses everything
- **Alliance selection table** — ranks all teams with confidence scores and auton compatibility
- **Team profiles** — drivetrain, auton side, reliability %, strategy tags, scouting notes
- **Scouting** — rate any team's auto and driver on 0-10, keep private notes
- **Find & Connect** — search ~10k teams in the database, send connection requests
- **Direct messaging** — chat with connected teams, global side panel with unread indicators
- **Kanban task board** — organize your team's to-do list with drag and drop
- **Skills rankings** — worldwide and provincial rankings
- **Admin panel** — manage teams and view generated passwords

---

## Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS 3.4  
**Backend:** Next.js API routes, NextAuth.js, Prisma ORM, bcryptjs, Zod  
**Database:** PostgreSQL on Neon  
**Hosting:** Vercel

---

## The Bayesian Model

The rating engine is in `src/lib/bayesian.ts` (~430 lines). Here's the gist:

1. Every team starts at rating **100** with uncertainty **50**
2. Alliance strength is a 70/30 weighted average of the strongest and weakest team
3. Win probability uses the **Normal CDF**: `P(win) = Φ((R1 - R2) / combined_uncertainty)`
4. Stronger teams in an alliance get more credit/blame
5. Rating update: `new = old + K × credit × (actual - expected)` where K = 32
6. Uncertainty shrinks with expected results, grows with surprises
7. Teams with driver skills scores get a small initial rating bump

The constants came from a paper on Bayesian game rating. We tweaked them a bit during regionals and they seemed to work well.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # landing page
│   ├── layout.tsx            # root layout with fonts and session
│   ├── dashboard/            # main app (sidebar + all pages)
│   └── api/                  # all the backend routes
├── components/               # ~24 react components
├── lib/
│   ├── bayesian.ts           # the rating engine
│   ├── auth.ts               # nextauth config
│   ├── prisma.ts             # db client
│   └── skills.ts             # skills ranking logic
└── middleware.ts              # route protection
```

---

## Getting Started

```bash
git clone https://github.com/Kiddo4993/Spark-Vex-App.git
cd Spark-Vex-App
npm install

# set up your .env with DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npx prisma db push
npx prisma generate

npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | start dev server |
| `npm run build` | production build |
| `npm run db:push` | push schema to db |
| `npm run db:seed` | seed sample data |
| `npm run db:studio` | open prisma studio |

---

## Deployment

Deployed on Vercel with auto-deploy from GitHub. Database is Neon PostgreSQL with connection pooling. Auth uses JWT sessions (30 day expiry).

---

## License

MIT — see [LICENSE](./LICENSE)

---

<p align="center">
  <strong>Built by 77174A Holy Airball!</strong><br>
  <em>SparkVEX — Bayesian Alliance Engine</em>
</p>
