# SCRY by New Tarotories

SCRY is a dark-cosmic spiritual toolkit for tarot, oracle, astrology, numerology, channeled messages, journaling, ritual work, and intuitive self-reflection.

This is not a generic tarot app. It is intended to become a premium “witch’s toolkit” with a direct, grounded, emotionally honest voice.

## Start here

Autonomous coding agents should read this first:

[JULES_VISION_AND_TODO.md](./JULES_VISION_AND_TODO.md)

That document contains the product vision, agent rules, room-by-room requirements, and prioritized TODO list.

## Current direction

- Hosting: AWS Amplify
- Auth: Amazon Cognito direction
- Data/API: AWS-backed AppSync/DynamoDB/Lambda direction
- Payments: Wix Payments direction, not finished yet
- Source control: GitHub
- Live app: https://main.d9v72l1if77fe.amplifyapp.com

## Important rules

- Do not rebuild from scratch.
- Do not remove existing rooms or working fallbacks.
- Do not reintroduce Base44 dependencies.
- Do not commit secrets.
- Do not commit generated builds, deployment ZIPs, browser screenshots, logs, or `.env` files.
- Run a production build before claiming a coding task is done.

## Local development

Install dependencies:

```powershell
npm install
```

Run locally:

```powershell
npm run dev
```

Build:

```powershell
npm run build
```

## Deployment note

The app has been manually deployed to AWS Amplify using a packaged `dist` ZIP. The next infrastructure task is to connect Amplify directly to this GitHub repo so future deploys come from `main` instead of manual ZIP uploads.

## Current highest priorities

1. Connect Amplify to GitHub.
2. Add safe environment/config documentation.
3. Build Wix Payments checkout/subscription verification.
4. Build owner/admin room for analytics, user lookup, and manual premium grants.
5. Finish backend persistence for readings, journal, altar, premium state, and analytics.
