# CV Fit Checker

Paste a job description, upload a CV (PDF or Word), and get a match score plus specific tailoring advice powered by Claude. Sign in with Clerk; each analysis is saved to your private history.

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- A [Clerk](https://dashboard.clerk.com/) application (Next.js)
- A Postgres database ([Neon](https://console.neon.tech/) works well on Vercel)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env example and fill in secrets:

```bash
cp .env.local.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Server-side Claude calls (never sent to the browser) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Auth |
| `DATABASE_URL` | Postgres connection string for analysis history |

In Clerk, allow redirects for `http://localhost:3000` and your Vercel domain.

3. Create the database tables:

```bash
npx prisma migrate dev --name init
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be prompted to sign in.

## How it works

1. Clerk protects `/`, `/history`, and `/api/analyze`.
2. The form POSTs the job description and CV to `/api/analyze`.
3. `lib/parseFile.ts` extracts text with **unpdf** (PDF) or **mammoth** (.docx).
4. Claude returns `{ score, verdict, strengths, gaps, missingKeywords, tailoringTips }`.
5. The result is stored in Postgres (JD + score/advice + CV filename — **not** raw CV text) and listed under **History**.

## Deploy (Vercel)

1. Push to GitHub and import in Vercel.
2. Add these env vars in **Project Settings → Environment Variables** for
   **Production** and **Preview** (Preview builds fail or show a setup page without them):

   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`

3. In Clerk, add your Vercel URLs under allowed redirect / origins.
4. Set the build command to include Prisma generate (already in `npm run build`):

```bash
npx prisma generate && next build
```

5. Run migrations against production once:

```bash
npx prisma migrate deploy
```

(Or use `prisma db push` for a quick first schema sync.)
