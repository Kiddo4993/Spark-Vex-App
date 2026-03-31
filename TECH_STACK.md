# SparkVEX Tech Stack & Codebase Reference

Welcome to the definitive breakdown of the technology stack, libraries, and architectural decisions we used to build SparkVEX. Consider this your cheat sheet for understanding exactly what makes this app tick!

## Core Framework
- **[Next.js 14.2](https://nextjs.org/)**: The rock-solid foundation of the app. We're using the modern **App Router** (`src/app`) exclusively here. It handles all our server-side rendering, static site generation, and gives us blazing fast API routes natively.
- **[React 18.3](https://react.dev/)**: The core UI library supporting cool stuff like React Server Components and all our custom hooks.
- **[TypeScript 5](https://www.typescriptlang.org/)**: The entire application is strongly typed. This gives us end-to-end type safety all the way from the raw database schema straight up to the weirdest edge cases in our React components.

## Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)**: Our relational database of choice, hosted over on Neon so it scales beautifully.
- **[Prisma (v5.22)](https://www.prisma.io/)**: The Object-Relational Mapper (ORM) we use to interact safely with Postgres. 
  - **Schema Location**: Check out `prisma/schema.prisma`
  - All of our database models (Users, Teams, Matches, Performance History) live here. To sync any changes to the cloud, you just run `npm run db:push`.

## Authentication & Security
- **[NextAuth.js (v4.24)](https://next-auth.js.org/)**: This library handles our authentication sessions, secure cookies, and session callbacks. 
  - **Config Location**: `src/lib/auth.ts`
  - We use a custom credentials provider which strictly associates every login directly with an official Team's unique ID.
- **[bcryptjs (v2.4.3)](https://www.npmjs.com/package/bcryptjs)**: We use this to securely hash and salt user passwords before tossing them into the database, and to check them when users try to log back in.

## Styling & UI Experience
- **[Tailwind CSS (v3.4.14)](https://tailwindcss.com/)**: Our favorite utility-first CSS framework. It let us build the UI at lightspeed.
  - **Config**: Peek inside `tailwind.config.ts`. We built out a highly customized design system, bringing in specific brand token colors (like `alliance.red`, `alliance.blue`, and `surface.bg`) along with custom font definitions.
- **[PostCSS](https://postcss.org/) & [Autoprefixer](https://github.com/postcss/autoprefixer)**: These run quietly in the background to process Tailwind and ensure our styles actually work across all browsers.
- **[react-hot-toast (v2.6.0)](https://react-hot-toast.com/)**: Used for those smooth, lightweight toast notifications you see popping up across the app whenever you save or break something.
- **Next Font (`next/font/google`)**: We self-host Google fonts to completely eliminate layout shift. The app uses three main fonts: *Syne* for heavy headers, *Space Mono* for critical numeric data, and *Inter* for standard reading.

## Data Parsing & Validation
- **[Zod (v3.23.8)](https://zod.dev/)**: This handles schema declaration and heavily-typed data validation. We slap this on our API routes to make absolutely sure incoming POST and PUT requests aren't sending garbage data to the database.
- **[xlsx (v0.18.5)](https://docs.sheetjs.com/)**: This library is the unsung hero of the match import flow (`src/app/dashboard/import/page.tsx`). It lets us directly parse proprietary Excel files exported straight out of VEX Tournament Manager.
- **[csv-parse (v6.1.0)](https://csv.js.org/parse/)**: Our reliable secondary library for chewing through raw CSV data files if needed.

## Core Proprietary Logic
- **Bayesian Performance Model**: 
  - **Location**: `src/lib/bayesian.ts`
  - **Purpose**: This is the custom mathematical engine that drives the entire value prop of SparkVEX. It calculates a team's true performance rating and uncertainty margin based on match outcomes, effectively isolating what an individual robot contributed from their alliance-wide score.

## Key Development Commands
Here are the essential scripts you can run inside the project terminal (they live in `package.json`):
```bash
# Boot up the local Next.js development server
npm run dev

# Generate the Prisma client and build the app for production
npm run build 

# Sync your local Prisma schema changes up with the live Neon database
npm run db:push

# Open the Prisma database studio to visually inspect your raw tables
npm run db:studio

# Run database seeders to populate fake testing data (using tsx)
npm run db:seed
```

## Complete `package.json` Library List

For total transparency, here is an exhaustive list of every single library included in our `package.json`.

### Dependencies (Production)
- **`@prisma/client`**: Auto-generated query builder so we can talk to the database safely with TypeScript.
- **`bcryptjs`**: Does the heavy lifting for hashing and securing user passwords.
- **`csv-parse`**: Transforms messy CSV strings into neat arrays or objects for data imports.
- **`next`**: The core React framework powering our frontend and the backend API routing.
- **`next-auth`**: Handles all the open-source authentication, session management, and callbacks.
- **`react`**: The UI library doing the actual building of components.
- **`react-dom`**: The package responsible for officially rendering our React components to the DOM.
- **`react-hot-toast`**: The library responsible for firing off those slick success and error toasts.
- **`xlsx`**: The spreadsheet parser that lets us read Tournament Manager exports (.xls and .xlsx files) directly in the browser without server-side processing.
- **`zod`**: Blocks malformed or malicious data from hitting the database APIs via strict typing.

### devDependencies (Development & Build stuff)
- **`@types/bcryptjs`, `@types/node`, `@types/react`, `@types/react-dom`**: Official TypeScript definition files so our IDE autocomplete actually works.
- **`autoprefixer`**: A PostCSS plugin that automatically adds vendor prefixes to our CSS so we don't have to worry about browser support.
- **`eslint`, `eslint-config-next`**: The linter tool configured for Next.js to slap our wrists when we write sloppy code.
- **`postcss`**: The CSS transformation tool required to make Tailwind actually run.
- **`prisma`**: The Prisma Command Line Interface (CLI) used for pushing schemas and opening the database Studio.
- **`tailwindcss`**: The utility-first CSS framework itself.
- **`tsx`**: Lets us natively execute TypeScript files (specifically `prisma/seed.ts`) in the terminal without having to manually compile them first.
- **`typescript`**: The actual TypeScript compiler.

## The Chat & Messaging System Architecture

You might be wondering: *"Where exactly is the websocket library? Did you use Socket.io, Pusher, or Firebase for the messaging feature?"*

**Nope! We built the entire Global Chat System completely out of scratch using the existing stack.** 

We specifically designed the messaging system to run natively on our Next.js API Routes and PostgreSQL database so we wouldn't have to introduce any expensive, heavy third-party real-time dependencies. Here is exactly how the chat works under the hood:

1. **Database Persistence (`Prisma`)**: Every time you send a message, it is instantly inserted as a row into the `Message` table natively via Prisma. The row stores the `content`, who sent it, who is receiving it, and a simple boolean `read` flag so we can trigger those unread notification badges.
2. **Global State (`React Context`)**: We wrap the entire app in a custom `<ChatProvider>` React Context. This essentially behaves as a global memory bank, allowing the chat state (whether the panel is open, who you are talking to, and how many unread messages you have) to persist incredibly smoothly even as you hop around the dashboard pages.
3. **Active API Polling**: Instead of keeping a heavy, continuous WebSocket connection open (which gets extremely expensive to host at scale), the `GlobalChatPanel` component leverages standard React `useEffect` hooks and a `setInterval` timer. It actively pings the `/api/messages` endpoint every **5 seconds**. If you are staring at a conversation, it rapidly pulls any new rows from the database. It basically creates a perfect *illusion* of a real-time WebSocket connection to the user!
4. **UI/UX Magic**: The beautiful red styling, the effect that auto-scrolls you to the newest message at the bottom of the chat, and the 12-hour timestamp formatting is entirely handled using vanilla React references and Tailwind CSS. 

Because we architected it this way, SparkVEX remains phenomenally fast, entirely self-contained, and perfectly compatible with serverless Edge environments. We save huge amounts on hosting costs while still delivering a premium, real-time chat experience for the teams!
