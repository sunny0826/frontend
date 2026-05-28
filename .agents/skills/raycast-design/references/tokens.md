# Raycast Design — Tokens

## 0. Primitives

These tokens intentionally mirror the current project's theme colors. Raycast red (`#FF6363`) is an observed source value only and must not replace the host accent.

### Color Ramps

**Neutral: slate, from the current app theme**

| Step | Hex | Use |
|---|---|---|
| 50 | `#F8FAFC` | Light background |
| 100 | `#F1F5F9` | Light surface |
| 200 | `#E2E8F0` | Light borders and dark-mode primary text |
| 300 | `#CBD5E1` | Light visible border and dark secondary text |
| 400 | `#94A3B8` | Disabled/placeholder text |
| 500 | `#64748B` | Muted text |
| 600 | `#475569` | Current border/input |
| 700 | `#334155` | Current secondary/accent surface |
| 800 | `#1E293B` | Current card surface |
| 900 | `#0F172A` | Current app background |
| 950 | `#020617` | Deep overlay |

**Brand / host accent: green, from the current app theme**

| Step | Hex |
|---|---|
| 50 | `#F0FDF4` |
| 100 | `#DCFCE7` |
| 200 | `#BBF7D0` |
| 300 | `#86EFAC` |
| 400 | `#4ADE80` |
| 500 | `#22C55E` — existing primary |
| 600 | `#16A34A` |
| 700 | `#15803D` |
| 800 | `#166534` |
| 900 | `#14532D` |
| 950 | `#052E16` |

**Status**

| Color | 50 | 500 | 900 |
|---|---|---|---|
| Red | `#FEF2F2` | `#EF4444` | `#7F1D1D` |
| Green | `#F0FDF4` | `#22C55E` | `#14532D` |
| Amber | `#FFFBEB` | `#F59E0B` | `#78350F` |

### Spacing Primitives

`0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 96`

### Radii Primitives

`0, 4, 6, 8, 12, 16, 999`

---

## 1. Typography

### Font Stack

| Role | Font | Fallback | Weight | Use |
|---|---|---|---|---|
| Display | `Inter` | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | 650 | Hero headings, major screen titles |
| Body / UI | `Inter` | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | 500 | UI labels, rows, descriptions |
| Mono / Code | `JetBrains Mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | 500 | Shortcuts, commands, code, technical labels |

### Mono Font Rules

**`mono_for_code`: true** · **`mono_for_metrics`: false**

Use mono for command snippets, keyboard shortcuts, file paths, API endpoints, and inline code. Do not use mono for general dashboard numbers unless the number is a technical identifier. Raycast uses mono for tiny technical labels, but its marketing and UI metrics remain mostly in the sans.

### Type Scale

| Token | Size | Line Height | Letter Spacing | Weight | Use |
|---|---:|---:|---:|---:|---|
| `--display` | 48px | 1.05 | 0em | 650 | Hero or command-center title |
| `--heading` | 32px | 1.15 | 0em | 650 | Section heading |
| `--subheading` | 20px | 1.3 | 0em | 600 | Card titles |
| `--body` | 14px | 1.6 | 0em | 500 | Primary UI text |
| `--body-sm` | 13px | 1.5 | 0em | 500 | Secondary rows |
| `--caption` | 12px | 1.4 | 0em | 500 | Metadata, timestamps |
| `--label` | 11px | 1.2 | 0.02em | 600 | Keyboard hints and micro-labels |

### Typographic Rules

- Use Inter for every readable UI label and description.
- Use JetBrains Mono only for code-like content, keyboard keys, shortcuts, and command syntax.
- Keep letter spacing at `0` for normal text; only mono micro-labels may use `0.02em`.
- Card titles use 600 weight, not color, to establish hierarchy.

---

## 2. Color System

### Primary Mode: dark

| Token | Primitive | Hex | Role |
|---|---|---|---|
| `--background` | `{neutral.900}` | `#0F172A` | Current page background |
| `--bg` | alias | `var(--background)` | Shorthand |
| `--surface1` | `{neutral.800}` | `#1E293B` | Cards |
| `--surface2` | `{neutral.700}` | `#334155` | Nested surfaces and selected rows |
| `--surface3` | `{neutral.600}` | `#475569` | Inputs, wells, strong controls |
| `--border` | `{neutral.700}` | `#334155` | Subtle borders |
| `--border-visible` | `{neutral.600}` | `#475569` | Inputs and active control borders |
| `--text1` | `{neutral.200}` | `#E2E8F0` | Primary text |
| `--text2` | `{neutral.300}` | `#CBD5E1` | Secondary text |
| `--text3` | `{neutral.500}` | `#64748B` | Metadata |
| `--text4` | `{neutral.600}` | `#475569` | Disabled |
| `--accent` | `{brand.500}` | `#22C55E` | Current primary accent |
| `--accent-subtle` | `{brand.950}` | `#052E16` | Accent tint |
| `--success` | `{green.500}` | `#22C55E` | Success |
| `--warning` | `{amber.500}` | `#F59E0B` | Warning |
| `--error` | `{red.500}` | `#EF4444` | Error/destructive |

### Secondary Mode: light

| Token | Primitive | Hex | Role |
|---|---|---|---|
| `--background` | `{neutral.50}` | `#F8FAFC` | Light page background |
| `--surface1` | `{neutral.100}` | `#F1F5F9` | Cards |
| `--surface2` | `{neutral.200}` | `#E2E8F0` | Nested surfaces |
| `--surface3` | `{neutral.300}` | `#CBD5E1` | Inputs, wells |
| `--border` | `{neutral.200}` | `#E2E8F0` | Subtle borders |
| `--border-visible` | `{neutral.300}` | `#CBD5E1` | Visible borders |
| `--text1` | `{neutral.900}` | `#0F172A` | Primary text |
| `--text2` | `{neutral.700}` | `#334155` | Secondary text |
| `--text3` | `{neutral.500}` | `#64748B` | Metadata |
| `--text4` | `{neutral.400}` | `#94A3B8` | Disabled |
| `--accent` | `{brand.500}` | `#22C55E` | Current primary accent |
| `--accent-subtle` | `{brand.50}` | `#F0FDF4` | Accent tint |

### Color Usage Rules

- Preserve existing project theme colors before applying this skill.
- Use accent for active command, selected segment, primary button, progress, and focus ring.
- Use neutral overlays for hover. Do not use `--accent-subtle` as a generic hover fill.
- Raycast red is not a token in this skill. Use it only in written provenance if needed.

---

## 3. Spacing

| Token | Value | Use |
|---|---:|---|
| `--space-2xs` | 2px | Hairline alignment |
| `--space-xs` | 4px | Icon/key gaps |
| `--space-sm` | 8px | Dense row padding |
| `--space-md` | 16px | Standard gaps |
| `--space-lg` | 24px | Card padding |
| `--space-xl` | 32px | Major group gaps |
| `--space-2xl` | 48px | Section gaps |
| `--space-3xl` | 64px | Large sections |
| `--space-4xl` | 96px | Hero/landing breathing room |

---

## 4. Borders & Radii

| Token | Value | Use |
|---|---:|---|
| `--radius-element` | 4px | Keyboard keys, checkboxes |
| `--radius-control` | 8px | Buttons, inputs, command rows |
| `--radius-component` | 12px | Cards, panels |
| `--radius-container` | 16px | Nav shell, modals |
| `--radius-pill` | 999px | Filter pills and badges |

Raycast corners are soft but not bubbly. Cards at 12px and containers at 16px are the upper bound for product UI.

---

## 5. Elevation & Shadows

| Level | Light | Dark | Use |
|---|---|---|---|
| 0 | `none` | `none` | Inline elements |
| 1 | `inset 0 1px 0 rgba(255,255,255,.7), 0 1px 2px rgba(15,23,42,.06)` | `inset 0 1px 0 rgba(255,255,255,.10), 0 0 0 1px rgba(255,255,255,.03)` | Cards |
| 2 | `inset 0 1px 0 rgba(255,255,255,.8), 0 12px 28px rgba(15,23,42,.12)` | `inset 0 1px 0 rgba(255,255,255,.12), 0 16px 56px rgba(2,6,23,.45)` | Menus, raised panels |
| 3 | `0 24px 64px rgba(15,23,42,.18)` | `0 32px 80px rgba(2,6,23,.68), inset 0 1px 0 rgba(255,255,255,.12)` | Modals |

Depth comes from border + gradient + inset highlight. Shadows are support, not decoration.

---

## 6. Motion

| Type | Duration | Easing | Use |
|---|---|---|---|
| Micro | 120ms | `cubic-bezier(.16, 1, .3, 1)` | Press, hover color |
| Standard | 180ms | `cubic-bezier(.16, 1, .3, 1)` | Row selection, popover |
| Emphasis | 300ms | `cubic-bezier(.16, 1, .3, 1)` | Dialog or nav expansion |

Pressed controls may scale to `0.98`. Hover row movement is limited to 0-2px.

---

## 7. Iconography

> Fallback disclosure: generated previews use Tabler Icons as a freely licensed approximation. Raycast's actual icons are proprietary.

| Attribute | Value |
|---|---|
| Description | Custom outline icons and arrows, about 1.5px stroke, rounded caps, geometric and minimal |
| Stroke weight | regular (~1.5px) |
| Corner treatment | soft |
| Fill style | outline with occasional solid marks |
| Form language | geometric |
| Visual density | minimal to balanced |

- **Kit:** Tabler Icons
- **Weight:** outline 1.5px
- **Match score:** high
- **CDN:** `https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.41.1/dist/tabler-icons.min.css`
- **Usage:** `<i class="ti ti-command"></i>`
