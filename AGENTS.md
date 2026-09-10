# AGENTS.md

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build (typecheck runs first)
npm run lint       # oxlint (NOT ESLint)
npm run preview    # serve production build
```

No test runner exists. No `test` script in package.json.

## Stack

React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + Flowbite React + Zustand + React Query + React Router v7. Backend is Laravel (API returns Laravel pagination/envelope shapes). Linter is **oxlint** (Rust-based), not ESLint.

## Architecture

Single-page app for Ecuador SRI electronic invoicing. All UI and types are in **Spanish** (`es-EC` locale).

- **Entry**: `src/main.tsx` → `src/App.tsx` → `src/routes/AppRouter.tsx`
- **API layer**: `src/api/client.ts` (Axios, auto-attaches Bearer token) + per-resource modules. Base URL from `VITE_API_URL` (default `http://localhost:3001/api`). All endpoints require a `ruc` query param for tenant isolation.
- **State**: One Zustand store (`src/stores/authStore.ts`) for auth only — persisted to localStorage. Everything else is React Query cache or local `useState`.
- **Forms**: Auth forms use react-hook-form + Zod. Complex document forms (invoices, credit notes, etc.) use **raw `useState`** with extracted pure-logic companion modules (`invoiceForm.ts`, `quickCreditNoteForm.ts`, etc.). Form item values are **strings** — converted to numbers only at submission.
- **Types**: Single file `src/types/api.ts` (880+ lines). Entity fields use `snake_case` (Laravel); SRI XML fields use `camelCase`. This is intentional.

## Key Conventions

- **No dark mode.** Theme is light-only, defined via Tailwind v4 `@theme` in `src/index.css` (no `tailwind.config.js`).
- **No test infrastructure.** No vitest/jest/testing-library installed.
- **Tailwind v4 CSS-first config.** Custom colors/shadows/radii are CSS custom properties under `@theme {}`.
- **Company-scoped multi-tenancy.** `selectedRuc` from auth store is passed to every API call. `useCompany` hook auto-selects the first company.
- **Base font size is 15px** (not 16px). Fonts: Inter (UI), IBM Plex Mono (data/numbers).
- **Env**: Copy `.env.example` → `.env`. Only `VITE_API_URL` is used.
- **Document forms** have three modes (`create`, `edit`, `view`) determined by URL path.

## Adding New Documents

Follow the existing pattern (e.g. `useQuickInvoices.ts` + `invoices/`):
1. API module in `src/api/` (list/detail/create/update/delete/send)
2. React Query hooks in `src/hooks/` — queries disabled until `ruc` is available, mutations invalidate parent query key
3. Pure-logic companion module in the page directory (e.g. `invoiceForm.ts`)
4. List page, form page, and view modal under `src/pages/`
5. Types added to `src/types/api.ts`
6. Routes added to `src/routes/AppRouter.tsx`
7. Sidebar entry in `src/components/layout/Sidebar.tsx`
