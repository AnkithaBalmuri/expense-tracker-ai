# Expense Tracker

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
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Vercel Deployment

Deploy this project directly to Vercel and add `MONGODB_URI` in Project Settings > Environment Variables for Production, Preview, and Development. No Express server or separate backend is required.

After deployment, open `/api/health`. It should return `{ "status": "ok", "database": "expense-tracker" }`. If it returns `503`, make sure your Atlas Network Access list permits the Vercel deployment and that `MONGODB_URI` is set in Vercel.
