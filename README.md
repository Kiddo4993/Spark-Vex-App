# SparkVEX (Imbued with Bayesian Performence Model)

> **Smarter, data-driven alliance selection for VEX Robotics.**  
> Upload your match data, track true performance ratings, scout your opponents, and find the absolute perfect alliance partner for your team.

**Live Site:** [spark-vex-app.vercel.app](https://spark-vex-app.vercel.app)  
**Built By:** Team 77174A Holy Airball!  
**Creator:** Dylan Duan

---

## Why did we build this?

Let's be honest: most VEX teams pick their alliance partners based on vibes, gut feelings, and raw win/loss records. We wanted a smarter, more reliable way to scout. So, we built a **Bayesian performance model** that actually calculates how good an individual team is, even though they only ever play mixed together in 2v2 alliances.

Our app looks closely at who was on each alliance, who they played against, and how much credit each team really deserves for the final score. After crunching the numbers, it spits out a **rating** and a **confidence interval** for every single team at your tournament. We've been using it live at our regionals, and it's been an absolute game-changer for alliance selection.

---

## What can you do with it? (Intro)

- **Bayesian Ratings**: Every team gets a true performance score plus an uncertainty margin. It's way deeper than just "did they win or lose?"
- **Pain-Free Imports**: Just upload the `.xls` file straight from Tournament Manager and the app handles the rest.
- **Alliance Selection Dashboard**: Instantly rank all the teams at your event. It automatically highlights conflicting auton routines and warns you about low-confidence scores.
- **Deep Team Profiles**: Keep track of a team's drivetrain, auton side, reliability percentage, strategy tags, and private scouting notes.
- **Private Scouting Worksheet**: Rate any team's autonomous and driver control skills on a 0 to 10 scale. Your notes stay completely private to your team.
- **Global Database**: Search through our database of almost 10,000 teams to see what world-class programs are up to.
- **Direct Messaging**: Chat in real-time with connected teams using our global side panel (complete with neat little unread badges).
- **Kanban Task Board**: Manage your team's robot build and programming to-do list with a drag-and-drop workflow.
- **Skills Leaderboards**: Check out global worldwide and provincial skills rankings.
- **Admin Panel**: Easily manage your team accounts and secure passwords.

---

## How does the math actually work?

The brain of the app lives in `src/lib/bayesian.ts` (about 430 lines of code). Here is the basic rundown:

1. Every team starts out with a baseline rating of **100** and an uncertainty margin of **50**.
2. We calculate an alliance's total strength using a 70/30 weighted average of the strongest and weakest team.
3. To predict who will win, we use the **Normal CDF Math Function**: `P(win) = Φ((R1 - R2) / combined_uncertainty)`.
4. Naturally, the stronger teams in an alliance take on more of the credit (or the blame) for the final score.
5. After a match, the rating updates like this: `new = old + K × credit × (actual - expected)` (we use K = 32).
6. When a match goes exactly as expected, a team's uncertainty shrinks. If there is a massive upset, the uncertainty grows.
7. We also give teams a tiny initial rating bump based on their official driver skills scores.

The math constants actually come from a university paper on Bayesian game ratings. We tweaked the numbers during our local regionals until the predictions felt spot on!

---

## Tech Stack and Layout

All the good stuff is built on Next.js 14 and Postgres. Here is a quick map of the project:

```text
src/
├── app/
│   ├── page.tsx              # The landing page 
│   ├── layout.tsx            # Global layout wrapper (fonts, auth sessions)
│   ├── dashboard/            # The main app where all the magic happens
│   └── api/                  # All of our Next.js backend endpoints
├── components/               # Around 24 reusable React UI components
├── lib/
│   ├── bayesian.ts           # The heavy-lifting math engine
│   ├── auth.ts               # Secure NextAuth configuration
│   ├── prisma.ts             # The database client
│   └── skills.ts             # Skills ranking logic
└── middleware.ts             # Protects routes from unauthenticated users
```

---

## Run Locally (Just use the link above if you are too lazy)

Want to spin it up on your own machine? It's super easy:

```bash
# Clone the repo off GitHub
git clone https://github.com/Kiddo4993/Spark-Vex-App.git
cd Spark-Vex-App

# Install all the dependencies
npm install

# Make sure to set up your .env file with DATABASE_URL, NEXTAUTH_SECRET, and NEXTAUTH_URL

# Sync your database and generate the Prisma client
npx prisma db push
npx prisma generate

# Blast off!
npm run dev
```

### Helpful Scripts

| Command | What it actually does |
|---|---|
| `npm run dev` | Spins up your local development server |
| `npm run build` | Compiles the app for production |
| `npm run db:push` | Pushes your Prisma schema directly to your Postgres database |
| `npm run db:seed` | Fills your database with test data so you don't start empty |
| `npm run db:studio` | Opens a neat web interface to view your raw database tables |

---

## Deployment stuff (Just a heads up that the import match will last until 30 days of the same import)

We host the live site on Vercel with automatic deployments straight from GitHub. The database is running on Neon PostgreSQL using connection pooling so it doesn't crash under pressure, and we keep user sessions safe using NextAuth JWTs (which expire every 30 days).


<p align="center">
<<<<<<< HEAD
  <strong> by 77174A Holy Airball!</strong><br>
=======
  <strong>Built with love by 77174A Holy Airball!</strong><br>
>>>>>>> 4f9079c (more comments)
  <em>SparkVEX: Bayesian Alliance Engine</em>
</p>

