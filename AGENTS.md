<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (16.2) has breaking changes — APIs, conventions, and file structure may differ from your training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any new feature or route.** Heed deprecation notices. Do not assume stable-API behavior from Next.js 13/14/15 still applies.
<!-- END:nextjs-agent-rules -->

---

# Agent Guide — YOLO (ずっと、ともに。)

Pet photo AI analysis platform. ~34 screens: AI photo analysis, social feed, gamification (battles/rankings/crown), e-commerce, donation to shelters, admin dashboard.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe |
| AI | Claude Vision API (claude-sonnet-4-20250514) |
| Package manager | **pnpm** (never use npm or yarn) |

## Project Structure

```
src/
├── app/                  # App Router — filesystem routing
│   ├── api/analyze/      # Only API route (POST) — Claude Vision
│   ├── admin/            # Admin dashboard pages
│   └── [route]/page.tsx  # Each folder = URL path
├── components/
│   ├── ui/               # Primitives: Toast, FloatingCTA
│   ├── layout/           # Structural: Header, SideNav, BottomNav, AdminSideNav, FullScreenMenu
│   └── features/         # Domain-specific: auth/, social/, shop/, donation/, ambassador/
├── hooks/                # Custom hooks: useAuth, useCart
├── lib/                  # Business logic + third-party wrappers
│   ├── analyze.ts        # Claude Vision API service
│   ├── anthropic.ts      # Claude API/Agent SDK config
│   ├── image.ts          # Resize, validate, base64 encode
│   ├── share.ts          # Share image generation (Canvas API)
│   ├── session.ts        # Centralized sessionStorage management
│   ├── format.ts         # Currency (¥), date, number formatting
│   ├── validators.ts     # Image/input validation
│   ├── supabase.ts       # Supabase client singleton
│   └── mockData.ts       # Mock data for UI development
├── types/                # TypeScript interfaces (domain files + index.ts barrel)
└── config/               # Constants: storage-keys, site, plans, nav
```

## Conventions

### Package Manager

Always use `pnpm`. Commands: `pnpm add`, `pnpm remove`, `pnpm install`, `pnpm run <script>`.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json). Always use it for imports:

```ts
import { User } from '@/types';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
```

### Types

- All TypeScript interfaces and types live in `src/types/`.
- Domain files follow the pattern `<domain>.types.ts` (e.g., `shop.types.ts`, `auth.types.ts`).
- Re-export everything from `src/types/index.ts` so consumers import via `@/types`.
- Never define types inline in page or route files — extract to `src/types/`.

### Business Logic

- Business logic goes in `src/lib/`, never in `page.tsx` or `route.ts`.
- Route handlers (`src/app/api/`) must be thin: validate input, call a lib function, return a response.
- Pages (`page.tsx`) handle rendering and UI state only — data fetching and processing belong in lib or hooks.

### Components

- **`ui/`** — Generic primitives (buttons, modals, toasts). No domain knowledge.
- **`layout/`** — Structural shells (header, nav, sidebars). Minimal business logic.
- **`features/`** — Domain-specific components grouped by feature (`auth/`, `social/`, `shop/`, etc.).

### Constants and Config

- App-wide constants go in `src/config/` (site metadata, nav items, subscription plans, storage keys).
- Never hardcode magic strings or numbers in components — extract to config.

### Custom Hooks

- Custom hooks live in `src/hooks/`.
- Keep hooks focused: one concern per hook.

## Next.js 16 Specifics

**Read `node_modules/next/dist/docs/` before writing new features.** Key points:

- **App Router filesystem routing**: each folder under `src/app/` is a URL segment.
  - `page.tsx` = page component
  - `route.ts` = API endpoint (no UI)
  - `layout.tsx` = shared wrapper layout
  - `loading.tsx`, `error.tsx`, `not-found.tsx` = special UI states
- **Segment config exports** (`export const dynamic`, `export const maxDuration`, etc.) must be **static literals** — no computed values or variables.
- **Server Components** are the default. Add `'use client'` only when you need browser APIs, hooks, or event handlers.
- **Route handlers** (`route.ts`) run server-side. Use `NextRequest`/`NextResponse`.

## Supabase Patterns

- Client singleton in `src/lib/supabase.ts`. Import it; never create new clients.
- **RLS (Row Level Security)** must be enabled on all tables. Every new table needs RLS policies.
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is server-side only. Never import it in client components or expose it via `NEXT_PUBLIC_*`.
- Auth via Supabase Auth (Google, Apple, Email). Client-side auth state managed through `useAuth` hook.
- Storage buckets for user-uploaded images. Always validate file type and size before upload.

## State Management

No Redux or Zustand. State flows through:

1. **`useAuth` hook** — user profile, login/logout, try-count (localStorage-backed).
2. **`useCart` hook** — cart add/remove/clear (localStorage-backed).
3. **`lib/session.ts`** — photo analysis flow data (sessionStorage). Keys defined in `config/storage-keys.ts`.
4. **`lib/mockData.ts`** — hardcoded mock data powering all screens until Supabase integration is complete.

### Photo Analysis Flow

```
/try (upload + resize via lib/image.ts)
  → sessionStorage (via lib/session.ts)
    → /analyzing (POST /api/analyze → lib/analyze.ts → Claude Vision)
      → sessionStorage
        → /results (display top 3 scored photos)
```

## Styling

- **Tailwind CSS v4** with `@theme inline` block in `globals.css`.
- Custom theme colors: `accent` (#2A9D8F teal), `navy`, `gold`, `red`.
- Font: **Noto Sans JP** via Next.js font optimization.
- Animations: Framer Motion for page transitions and interactive elements; CSS `@keyframes` for simple loops.
- Use Tailwind utility classes. Avoid inline styles and CSS modules.

## Environment Variables

```
ANTHROPIC_API_KEY              # Claude Vision API (if unset, /api/analyze returns mock data)
CLAUDE_CODE_OAUTH_TOKEN        # Claude Agent SDK auth (Pro/Max, alternative to API key)
ANALYZE_SERVICE_PROVIDER       # "CLAUDE_CODE" to use Agent SDK, otherwise uses API key
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY      # Supabase service role (server-side only, never NEXT_PUBLIC_)
STRIPE_SECRET_KEY              # Stripe payments (server-side only)
```

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never prefix secrets.

## Testing

No test framework is configured yet. For E2E validation, use browser testing via Playwright MCP. Manual browser checks are acceptable for now.

## Quality Gates

Run these before completing any task or committing:

```bash
pnpm lint        # ESLint — fix all errors
pnpm typecheck   # tsc --noEmit — zero type errors
pnpm build       # Full production build must succeed
```

If `pnpm lint` reports fixable issues, run `pnpm lint:fix` first, then re-check. Never commit code that fails any of these checks.
