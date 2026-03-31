# YOLO

> **"Forever, Together."** (ずっと、ともに。)

A pet-focused AI platform that helps pet owners discover their best photos, share them with family, and contribute to animal shelters through an automated donation system.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript (strict mode) |
| UI | React 19 + Tailwind CSS v4 + Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| AI | Claude Vision API (pet photo analysis) |
| Payment | Stripe (Subscription + EC) |
| Hosting | Vercel |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server (Turbopack)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with autofix |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | TypeScript type checking |

## Project Structure

```
src/
├── app/                  # Pages + API routes (filesystem routing)
│   ├── api/analyze/      #   Claude Vision API endpoint
│   ├── admin/            #   Admin dashboard (10 pages)
│   └── [feature]/        #   User-facing pages (24 pages)
├── components/
│   ├── ui/               #   Primitives (Toast, FloatingCTA)
│   ├── layout/           #   Header, SideNav, BottomNav, AdminSideNav
│   └── features/         #   auth/, social/, shop/, donation/, ambassador/
├── hooks/                # useAuth, useCart
├── lib/                  # Business logic + utilities
│   ├── analyze.ts        #   Claude Vision API service
│   ├── image.ts          #   Image resize/validate
│   ├── share.ts          #   Share image generation (Canvas)
│   ├── session.ts        #   SessionStorage management
│   ├── format.ts         #   Currency/date formatting
│   ├── validators.ts     #   Input validation
│   ├── supabase.ts       #   Supabase client
│   └── mockData.ts       #   Mock data for UI development
├── types/                # TypeScript interfaces (9 domain files)
└── config/               # Storage keys, site config, plans, navigation
```

## Core Features

- **Best Shot AI** — Upload pet photos, Claude Vision ranks the top 3 with scores and commentary
- **Social Feed** — Posts, emotions (happy/funny/touched/crying), follows, battle voting
- **E-Commerce** — Merchandise with pet photos (2D goods, 3D figures, photobooks)
- **Donation System** — 10% of subscription + 5% of purchases auto-donated to NPOs
- **Ambassador Program** — 5-level ranking system across 47 Japanese prefectures
- **Admin Dashboard** — KPI metrics, user/order/donation/content management

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude Vision API (falls back to mock if unset) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `STRIPE_SECRET_KEY` | Stripe payments |

## Deployment

Deploy to Vercel:

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure DNS at onamae.com pointing to Vercel

| Branch | Deploys to |
|---|---|
| `main` | Production (yolo.jp) |
| `dev` | Preview (yolo-dev.vercel.app) |
| `feature/*` | PR preview URL |

## License

Proprietary. All rights reserved.

Copyright (c) 2026 GXO Inc. (GXO株式会社)
