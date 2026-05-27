---
name: raycast-design
description: "This skill should be used when the user explicitly says 'Raycast style', 'Raycast design', '/raycast-design', or directly asks to use/apply the Raycast design system. NEVER trigger automatically for generic UI or design tasks."
version: 1.0.0
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# raycast-design

You are a senior product designer. When this skill is active, every UI decision follows Raycast's command-center structure while preserving the host application's existing theme colors.

**Before starting design work, declare the required fonts and loading plan** from `references/platform-mapping.md`. Use Inter for UI and JetBrains Mono for command/code details.

---

## 1. Design Philosophy

Raycast is a dense command surface, not a decorative marketing skin. It feels fast because every element is compact, aligned, keyboard-addressable, and visually sorted by surface depth rather than by loud color. In this project, the theme colors are locked: keep the existing green primary, dark slate canvas, and current semantic tokens; borrow Raycast's glass panels, 1px borders, command rows, shortcut keys, and precise motion.

The primary tension is macOS polish inside a utilitarian launcher: soft glass and glow are allowed, but only around hard-working controls.

---

## 2. Craft Rules

**Preserve Color First.** Never replace project theme tokens with Raycast red. Use `--primary`, `--background`, `--card`, `--border`, and existing semantic tokens as the color source.

**Build Like a Command Palette.** Prefer searchable lists, selected rows, keyboard hints, compact action buttons, and split list-detail layouts over wide empty marketing cards.

**Use Layered Glass Sparingly.** Surfaces use dark neutral gradients, 1px borders, inset top highlights, and subtle blur. Do not stack glass inside glass unless the inner layer is an input, command row, or popover.

**Keep Density High.** Raycast cards are compact: 13-15px UI text, 8px row gaps, 24px card padding, and no unused hero-scale whitespace inside product surfaces.

**Make Motion Click, Not Swoosh.** Interactions finish in 120-180ms with precise easing. Pressed states scale to `0.98` only on direct controls.

| Layer | Purpose | Treatment |
|---|---|---|
| Canvas | App background | Existing `--background`, no new hue |
| Shell | Nav, windows, modals | Glass gradient, 1px border, inset highlight |
| Row | Commands, menu items | Transparent default, low-opacity hover, selected accent edge |
| Detail | Selected content | Slightly stronger surface, compact metadata |
| Accent | Active command only | Existing `--primary`, never Raycast red |

**Squint test:** the selected command and primary action should be visible immediately; everything else should recede into slate surfaces and white text hierarchy.

---

## 3. Anti-Patterns

- No replacing `--primary` with `#FF6363` or any Raycast source color.
- No broad red gradients, red glows, or Raycast logo-derived accents in application UI.
- No oversized 24px+ rounded cards; product cards stop at 12px and modals stop at 16px.
- No pastel backgrounds, beige surfaces, or one-off decorative color ramps.
- No large hero typography inside dashboards, dialogs, sidebars, or command rows.
- No card-inside-card nesting unless the inner surface is an input, command result, or popover.
- No heavy drop shadows on standard cards; use borders and inset highlights first.
- No slow page choreography over 300ms.
- No generic empty dashboards with fewer than eight meaningful rows/items.
- No icon-only buttons without tooltip or accessible label.
- No skeleton screens that flood the interface; prefer small inline loading bars.
- No changing existing theme files just to make this style work.

---

## 4. Workflow

1. **Declare fonts** - Inter and JetBrains Mono; see `references/platform-mapping.md`.
2. **Lock colors** - read the host app theme first and keep its semantic color tokens.
3. **Set structure** - use Raycast-inspired shell, command rows, cards, shortcut keys, and split views.
4. **Build components** - use specs from `references/components.md`.
5. **Check hierarchy** - squint test: selected command, search, and primary action must win.
6. **Verify both modes** - dark is primary; light must preserve the same semantic theme relationships.
7. **Test density** - long command names, empty state, 10+ results, and narrow layouts.

---

## 5. Reference Files

| File | Contains |
|---|---|
| `design-model.yaml` | Single source of truth, including the theme-preservation policy |
| `references/tokens.md` | Fonts, type scale, color policy, spacing, radii, elevation, motion, iconography |
| `references/components.md` | Buttons, cards, inputs, command rows, navigation, tags, overlays, states |
| `references/platform-mapping.md` | CSS variables, SwiftUI notes, React/Tailwind guidance |
