# Raycast Design — Components

All component specs preserve the host theme colors. Use Raycast for geometry and behavior, not for replacing the palette.

## 1. Buttons

| Variant | Background | Text | Border | Radius | Height |
|---|---|---|---|---:|---:|
| Primary | `--accent` | `#0F172A` | none | 8px | 36px |
| Secondary | subtle glass gradient | `--text1` | `1px solid rgba(255,255,255,.16)` | 8px | 36px |
| Ghost | transparent | `--text2` | none | 8px | 32px |
| Destructive | `--error-bg` | `--error` | `1px solid color-mix(in srgb, var(--error), transparent 45%)` | 8px | 36px |

**States**

| State | Change |
|---|---|
| Hover | strengthen border or surface by one neutral step |
| Active | `transform: scale(.98)` |
| Disabled | opacity `.4`, no transform |
| Focus | `0 0 0 3px var(--accent-subtle)` |

Use icons in buttons at 16px with a 6-8px gap. Prefer verbs like "Run", "Install", "Copy", "Open".

---

## 2. Cards / Surfaces

**Standard Card**
- Background: `linear-gradient(137deg, var(--surface1), var(--background))`
- Border: `1px solid var(--border)`
- Radius: 12px
- Padding: 24px
- Shadow: level 1

**Featured Card**
- Same radius and padding, plus radial top light using current `--accent` at low opacity.
- Do not change the base surface hue.

**Interactive Card**
- Hover: `border-color: var(--border-visible)` and subtle inset highlight.
- Selected: add a 2px left or top accent rail; do not fill the whole card with accent.

---

## 3. Command Rows

| Property | Value |
|---|---|
| Height | 44px |
| Padding | 8px 12px |
| Radius | 8px |
| Label | Inter 14px / 500 / `--text1` |
| Description | Inter 13px / 500 / `--text3` |
| Shortcut key | JetBrains Mono 11px, 4px radius |

Rows are the core Raycast unit. Use a leading 20-24px icon, text stack, optional metadata, and trailing key hint. Hover uses neutral surface only. Selected rows use accent rail or thin focus outline.

---

## 4. Inputs

| Property | Value |
|---|---|
| Height | 44px |
| Background | `var(--surface1)` or transparent inside glass shell |
| Border | `1px solid var(--border-visible)` |
| Focus | border `--accent`, ring `--accent-subtle` |
| Radius | 8px |
| Padding | 0 14px |
| Placeholder | `--text3` |

Search inputs may include command-key hints on the right. Keep them visually lighter than typed text.

---

## 5. Navigation

**Floating Nav**
- Height: 58-76px depending on viewport.
- Background: glass gradient over `--background`.
- Border: `1px solid var(--border)`.
- Radius: 16px.
- Links: 14px / 500 / `--text2`; hover to `--text1`.
- Primary action: existing `--primary` color.

**Tabs / Segments**
- Container is surface1 with 999px radius.
- Selected item uses `--surface2` and `--text1`; accent appears only as a small dot or underline when needed.

---

## 6. Tags, Badges, Keys

| Type | Height | Radius | Font | Treatment |
|---|---:|---:|---|---|
| Status badge | 24px | 999px | Inter 12px / 600 | semantic tint |
| Filter pill | 32px | 999px | Inter 13px / 600 | neutral, selected surface2 |
| Shortcut key | 20px | 4px | JetBrains Mono 11px | inset gradient, 1px border |

Every pill sets `line-height: 1`, symmetric padding, and no trailing whitespace.

---

## 7. Lists / Data Rows

| Property | Value |
|---|---|
| Min height | 44px |
| Padding | 8px 12px |
| Divider | 1px solid `--border`, only between groups |
| Selected | surface2 plus accent rail |
| Accessory | icon, shortcut key, or muted metadata |

Lists should look usable with 10+ rows. Avoid centered empty space.

---

## 8. Overlays

**Modal / Dialog**
- Background: `--surface1`
- Radius: 16px
- Border: `1px solid var(--border-visible)`
- Shadow: level 3
- Backdrop: `rgba(2,6,23,.68)` with blur
- Animation: fade + scale from `.96` to `1` in 150-180ms

**Popover / Dropdown**
- Background: `--surface1`
- Radius: 12px
- Padding: 4-8px
- Item height: 36px
- Selected item: neutral surface, not accent fill

---

## 9. State Patterns

**Empty State**
- Compact, centered in a bounded surface.
- Icon at 32px, title at subheading, description max two lines.
- One primary action only.

**Loading**
- Prefer thin inline progress bars or row-level shimmer.
- Full-card skeletons are allowed only for data-heavy pages.

**Error**
- Field errors use caption text below the field.
- Screen-level errors use an alert card with destructive color, not a full red page.

**Disabled**
- Opacity `.4`, layout preserved, no hover/focus/active state.

---

## 10. Toggle / Switch

Derived from Raycast segmented controls.

| Property | Value |
|---|---:|
| Track width | 40px |
| Track height | 24px |
| Track radius | 999px |
| Thumb size | 18px |
| Thumb offset | 3px |

Off track uses `--surface3`; on track uses `--accent`; thumb stays on the highest-contrast neutral.
