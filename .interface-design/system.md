# System — Factus Easy

## Direction

Professional Ecuadorian SRI electronic billing tool. Accountants, billing clerks, business owners processing financial/legal documents. The interface should feel clean, precise, trustworthy.

**Feel:** Clean neutral light theme. Inter for UI text, IBM Plex Mono for data/numbers. Subtle violet accent. Light theme only (no dark).

---

## Palette

### Primitives
- **Canvas**: `#f7f7f8` (app background, neutral light)
- **Surface**: `#ffffff` (elevated cards)
- **Surface-2**: `#f1f1f4` (hover / higher elevation)
- **Ink**: `#18181b` (primary text, near-black)
- **Muted**: `#6b7280` (secondary text)
- **Faint**: `#9ca3af` (tertiary text, disabled, placeholders)
- **Border**: `rgba(24, 24, 27, 0.08)` (subtle border)
- **Border-strong**: `rgba(24, 24, 27, 0.16)` (outlines, emphasis)

### Semantic
- **Accent**: `#6d28d9` (violet-700, links, active nav)
- **Accent-soft**: `#f4eefc` (active nav background) / `#e9defb` (soft-2)
- **Danger**: `#dc2626` (errors, destructive actions)
- **Success**: `#059669` (positive feedback)
- **Warning**: `#d97706` (caution signals)

### Shadows
- **Card**: `0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.04)` → `shadow-card`
- **Pop (dropdowns)**: `0 4px 12px rgba(16,24,40,0.12)` → `shadow-pop`

### Token names (Tailwind classes)
- `bg-canvas` / `bg-surface` / `bg-surface-2` / `bg-accent-soft` — backgrounds
- `text-ink` / `text-muted` / `text-faint` / `text-accent` — text
- `border-border-warm` (subtle) / `border-border` (strong) — borders
- `shadow-card` / `shadow-pop` — shadows

---

## Depth

**Subtle shadows + borders.** Depth via:
1. Subtle `rgba(24,24,27,0.08)` borders for separation
2. Single soft shadow (`shadow-card`) on cards, `shadow-pop` on floating dropdowns
3. Surface color shifts for elevation: canvas `#f7f7f8` → surface `#ffffff` → surface-2 `#f1f1f4`

---

## Typography

**Inter** for UI text, **IBM Plex Mono** for data, numbers, sequential (RUC, factura numbers).

| Role | Size | Weight | Font |
|------|------|--------|------|
| Heading 1 (page) | 20px | 600 | Inter |
| Heading 2 (card) | 14px | 600 | Inter |
| Body | 13-14px | 400/500 | Inter |
| Nav item | 13px | 500 | Inter |
| Label (nav groups) | 11px | 600, uppercase, tracking-wider | Inter |
| Data / numbers | 24px (2xl) | 600 | IBM Plex Mono |
| Sequential / RUC | 11px | 400 | IBM Plex Mono |

---

## Spacing

**8px base grid.** All spacing is multiples of 8.

- Micro: 4px (icon gaps)
- Component: 8px, 12px, 16px (within buttons, inputs, cards)
- Section: 24px, 32px (between groups)
- Major: 48px+ (page-level)

---

## Radii

- **Buttons / nav items**: 6px (`rounded-md`)
- **Cards**: 8px (`rounded-lg`)
- **Inputs**: 8px
- **Dropdowns**: 8px (`rounded-md`)
- **Avatar**: full (`rounded-full`)

---

## Motion

Fast micro-interactions, deceleration easing. No spring/bounce.

- **Hover transitions**: `transition-colors duration-150` on all interactive elements
- **Dropdown open**: `animate-slide-down` (opacity 0→1 + translateY(-4px→0), 0.15s ease-out)
- **Page change**: `animate-fade-up` (opacity + translateY(8px→0), 0.25s ease-out), keyed by `pathname`
- **Caret rotation**: `transition-transform duration-150`, rotate-180 when open
- **Respect `prefers-reduced-motion`**: global override reduces animation/transition to 0.01ms

Utility classes: `.animate-fade-in`, `.animate-slide-down`, `.animate-fade-up` (defined in index.css)

---

## Layout

### Shell
```
┌──────────┬────────────────────────┐
│          │ Header (h-14)          │
│ Sidebar  ├────────────────────────┤
│ (w-60)   │                        │
│          │ Content (flex-1)       │
│          │                        │
└──────────┴────────────────────────┘
```

- **Sidebar**: `w-60` (240px), `bg-surface` white, `border-r border-border-warm`
- **Header**: `h-14`, `bg-surface`, `border-b border-border-warm`, company selector left, avatar+user+logout right
- **Content**: `flex-1 overflow-y-auto p-6`, wrapped in `key={pathname} animate-fade-up`

### Sidebar structure
```
Logo (h-14, px-5): accent square "F" + "Factus Easy"
─────────────────
Nav groups
  Label: text-[11px] font-semibold uppercase tracking-wider text-faint px-2.5 mb-1.5
  Items: NavLink rounded-md px-2.5 py-2 text-[13px] transition-colors duration-150
    Active: bg-accent-soft text-accent + left accent bar (absolute h-4 w-0.5 bg-accent)
    Default: text-muted hover:bg-surface-2 hover:text-ink
─────────────────
Footer (border-t, px-5 py-3, font-mono text-[11px] text-faint)
```

### Company selector
- Single company: static text `text-[13px] font-medium text-ink` + `font-mono text-[11px] text-faint`
- Multiple: button with name + caret SVG (rotates when open), dropdown `absolute z-50 mt-1.5 min-w-[260px] animate-slide-down`
- Dropdown: `rounded-md border border-border-warm bg-surface shadow-pop` + "Empresas" label
- Items: `px-3 py-2 transition-colors duration-150`, active `bg-accent-soft text-accent`, hover `bg-surface-2`

---

## Component Patterns

### Buttons
- **Primary**: `bg-accent text-white px-4 py-1.5 text-[13px] font-medium rounded-md hover:bg-accent-hover transition-colors duration-150`
- **Secondary**: `border border-border-warm bg-surface text-ink rounded-md hover:bg-surface-2`
- **Ghost**: `text-muted hover:bg-surface-2 hover:text-ink transition-colors duration-150`
- **Danger**: same as secondary but `hover:text-danger`

### Inputs
- `bg-surface text-ink border border-border-warm rounded-lg px-3 py-2 text-[13px]`
- Focus: `ring-2 ring-accent/20 border-accent`
- Placeholder: `text-faint`

### Cards
- `rounded-lg border border-border-warm bg-surface p-5 shadow-card`

### Dropdowns
- `absolute z-50 rounded-md border border-border-warm bg-surface shadow-pop animate-slide-down`
- Items: `px-3 py-2 text-[13px] hover:bg-surface-2 transition-colors duration-150`

---

## Interaction States

Every interactive element needs:
- **Default**: Base style
- **Hover**: `hover:bg-surface-2` or `hover:text-accent` (with `transition-colors duration-150`)
- **Active/Pressed**: `bg-accent-soft`
- **Focus**: `ring-2 ring-accent/20 border-accent`
- **Disabled**: `text-faint opacity-50 cursor-not-allowed`

---

## Avoid

- Dramatic shadows (use only `shadow-card` / `shadow-pop`)
- Gradients
- Blur (`backdrop-filter: none`)
- Rounded corners > 12px (except full-circle avatars)
- Pure `#000000` or `#ffffff` (use `#18181b` ink / `#ffffff` surface is fine for cards)
- Flowbite layout components (use Tailwind + custom; Flowbite OK for forms)
