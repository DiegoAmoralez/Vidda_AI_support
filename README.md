# Vidda Compliance AI Coach

Interactive enterprise prototype for continuous compliance capability assessment at NordBank International.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

## Demo scenarios

1. Employee daily case: enter the Employee Demo, start Anna Kowalska’s case, submit a free-text or ordered response, review scoring and policy evidence, then save the recommendation.
2. Compliance risk detection: switch to Compliance Officer, open the capability heatmap and select Corporate Banking × Escalation.
3. Regulatory update: use Demo Controls to trigger AML Policy v4.7, review impact and generate targeted cases.
4. AI case generation: open AI Improvement, generate a draft and approve it as an expert.
5. Improvement measurement: launch and complete the AML Escalation Recovery Campaign.

## Architecture

- Next.js App Router, React, TypeScript and Tailwind CSS
- shadcn/Radix accessible UI primitives
- Zustand persisted session overlay on deterministic seed data
- Pure rule-based scoring and adaptive learning logic
- Recharts visualizations and Motion micro-interactions
- No external API, credentials or real banking data

Demo state is stored under `vidda-compliance-demo-v1` in browser local storage. Reset Demo restores the original seed state.

## Deployment

The app requires no environment variables and uses the default Next.js Vercel configuration. Import the repository into Vercel and use the standard `npm run build` command.

This prototype uses simulated data and predefined AI responses. The assistant does not replace authorized Compliance, Legal or Risk functions.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
