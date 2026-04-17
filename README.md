# Anchor

Anchor is an AI accountability agent that turns student goals into actionable
plans and keeps them on track to finish.

Anchor is built for all students, with intentional focus on HBCU students who
are often balancing class, work, leadership, financial pressure, and community
responsibility all at once.

## Why Anchor

When everything feels like it is pulling you under, you need something to keep
you grounded. That is Anchor.

## Core Product Loop

1. User logs in (Auth0 Google login flow)
2. User enters a goal (exam prep, capstone, internship apps, etc.)
3. Claude AI breaks it into exactly 4 clear, actionable tasks
4. User checks off tasks as they progress
5. Anchor updates progress and gives smart feedback

## Current Features

- Goal input dashboard
- "Generate Plan" flow
- Claude API integration with safe fallback tasks
- Task checklist with completion state
- Progress tracking and progress bar
- Smart feedback states:
  - No progress yet
  - Halfway momentum
  - Inactive reminder
  - Goal complete

## AI Prompt Contract

Anchor sends this prompt pattern to Claude:

Break this goal into exactly 4 clear, actionable steps.

Goal: "{{user_goal}}"

Rules:
- Each step must be short
- No explanations
- Return ONLY a JSON array of 4 strings

Expected shape:

```json
[
  "Define project requirements",
  "Implement core features",
  "Test functionality",
  "Fix bugs and finalize"
]
```

## Tech Stack

- React + Vite
- Auth0 (Google login)
- Claude API (Anthropic)

## Run Locally

```bash
npm install
npm run dev
```

## Environment Variables

Create/update `.env` with:

```bash
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
VITE_BYPASS_AUTH=false
```

If `VITE_ANTHROPIC_API_KEY` is missing, Anchor still works using a local
4-step fallback so the product flow remains testable.

Set `VITE_BYPASS_AUTH=true` only for local debugging if Auth0 setup blocks
rendering. Keep it `false` for demo/submission.

## Hackathon Positioning

- **Quality:** polished dashboard flow, auth, AI task generation, progress logic
- **Testing:** clear functional checkpoints and edge-case handling
- **Innovation:** student-centered accountability with explicit HBCU context,
  while still serving all students
