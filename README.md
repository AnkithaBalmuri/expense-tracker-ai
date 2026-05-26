# Olive Expense Tracker

A single-project full-stack expense tracker built with Next.js App Router, MongoDB, Mongoose, Tesseract.js OCR, Chart.js, React, and Tailwind CSS.

## Features

- Client-side bill OCR with Tesseract.js. No API keys.
- Expense CRUD with Next.js API routes.
- MongoDB persistence through `MONGODB_URI`.
- Category analytics, monthly summaries, budget alerts, and daily trends.
- Search and filters by category, month, and date range.
- Vercel-ready single repository deployment.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```bash
   MONGODB_URI=your_mongodb_connection_string
   LANGSMITH_TRACING=true
   LANGSMITH_ENDPOINT=https://api.smith.langchain.com
   LANGSMITH_API_KEY=your_langsmith_api_key
   LANGSMITH_PROJECT="expense tracker ai"
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Vercel Deployment

Deploy this project directly to Vercel and add `MONGODB_URI` in Project Settings > Environment Variables. No Express server or separate backend is required.

If you add server-side AI routes later, also add the LangSmith and Anthropic variables in Vercel Project Settings. Do not prefix these variables with `NEXT_PUBLIC_`, because they must stay server-side.
