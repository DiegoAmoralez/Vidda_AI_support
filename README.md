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
2. Retail RM role intelligence: switch to Compliance Officer and use the five-step scenario on Overview.
3. Parse the Retail RM job description, inspect exact source spans and approve the inferred EDD responsibility.
4. Open Role Catalog to inspect what a Retail RM must do, required L1–L5 proficiency, authority boundaries and approval history.
5. Open Role Mapping to approve Sofia Novak’s temporary Branch Deputy role and inspect the SoD warning.
6. Open Learning Plans to approve High exposure and the deduplicated, evidence-based interventions.
7. Open Traceability to navigate from AML obligation to employee evidence and generate an as-of evidence manifest.
8. Regulatory update: use Demo Controls to trigger AML Policy v4.7, then reassess the role-intelligence snapshot.

## Architecture

- Next.js App Router, React, TypeScript and Tailwind CSS
- shadcn/Radix accessible UI primitives
- Zustand persisted session overlay on deterministic seed data
- Pure rule-based scoring, parsing, role-profile, risk and learning logic
- Canonical `JobRole` domain kept separate from portal access personas
- Versioned source spans, approval gates and bidirectional traceability fixtures
- Recharts visualizations and Motion micro-interactions
- No external API, credentials or real banking data

Demo state is stored under `vidda-compliance-demo-v1` in browser local storage with schema version 2 migration. Reset Demo restores the original seed state.

## Product specification

The implementation-ready banking specification is in
[`docs/role-capability-risk-training-system-spec.md`](docs/role-capability-risk-training-system-spec.md).
It covers governance, RBAC, requirements, lifecycle, parsing, L1–L5 proficiency,
risk methodology, multi-role mapping, learning, traceability, 20 workflows,
integration contracts, security, 20 acceptance criteria and the Retail RM example.

The specification describes production controls. The running app remains a
deterministic prototype: AI output, integrations, approvals, audit hashes and
banking data are simulated locally.

## Deployment

The app requires no environment variables and uses the default Next.js Vercel configuration. Import the repository into Vercel and use the standard `npm run build` command.

This prototype uses simulated data and predefined AI responses.
