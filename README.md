# CV Fit Checker

Paste a job description, upload a CV (PDF or Word), and get a match score plus specific tailoring advice powered by Claude.

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env example and add your key:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`ANTHROPIC_API_KEY` is read only on the server (`app/api/analyze/route.ts`). It is never exposed to the browser.

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. The form on `app/page.tsx` POSTs the job description and CV file to `/api/analyze`.
2. `lib/parseFile.ts` extracts text with **unpdf** (PDF; serverless-safe PDF.js build) or **mammoth** (.docx).
3. The API route sends both texts to Claude (`claude-sonnet-4-6`) and returns JSON:
   - `score` (0–100)
   - `verdict`
   - `strengths[]`
   - `gaps[]`
   - `missingKeywords[]`
   - `tailoringTips[]`

Scanned / image-only PDFs return a clear error instead of crashing — they have no extractable text.

Uploads are capped at **5 MB**. The analyze route also applies a simple per-IP rate limit (10 requests / minute) to reduce casual Anthropic key abuse on a public deploy.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add `ANTHROPIC_API_KEY` in Project Settings → Environment Variables.
4. Deploy.
