# Raycast Design — Platform Mapping

## 1. HTML / CSS / Web

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.41.1/dist/tabler-icons.min.css">
```

### Preserve Existing Theme Colors

When applying this skill inside this repository, do not replace `src/styles/theme.css`. Map Raycast-inspired component tokens to the current semantic variables:

```css
:root {
  --ray-bg: var(--background);
  --ray-fg: var(--foreground);
  --ray-card: var(--card);
  --ray-primary: var(--primary);
  --ray-primary-fg: var(--primary-foreground);
  --ray-secondary: var(--secondary);
  --ray-border: var(--border);
  --ray-ring: var(--ring);
}
```

### Standalone Preview Tokens

Use this block only for standalone previews or new surfaces that do not already have project theme variables.

```css
:root,
[data-theme="dark"] {
  --background: #0F172A;
  --bg: var(--background);
  --surface1: #1E293B;
  --surface2: #334155;
  --surface3: #475569;
  --border: #334155;
  --border-visible: #475569;
  --text1: #E2E8F0;
  --text2: #CBD5E1;
  --text3: #64748B;
  --text4: #475569;
  --accent: #22C55E;
  --accent-subtle: #052E16;
  --success: #22C55E;
  --success-bg: #052E16;
  --warning: #F59E0B;
  --warning-bg: #78350F;
  --error: #EF4444;
  --error-bg: #7F1D1D;
  --font-display: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --text-display: 48px;
  --text-heading: 32px;
  --text-subheading: 20px;
  --text-body: 14px;
  --text-body-sm: 13px;
  --text-caption: 12px;
  --text-label: 11px;
  --space-2xs: 2px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  --radius-element: 4px;
  --radius-control: 8px;
  --radius-component: 12px;
  --radius-container: 16px;
  --radius-pill: 999px;
  --shadow-1: inset 0 1px 0 rgba(255,255,255,.10), 0 0 0 1px rgba(255,255,255,.03);
  --shadow-2: inset 0 1px 0 rgba(255,255,255,.12), 0 16px 56px rgba(2,6,23,.45);
  --shadow-3: 0 32px 80px rgba(2,6,23,.68), inset 0 1px 0 rgba(255,255,255,.12);
  --ease-fast: cubic-bezier(.16, 1, .3, 1);
  --ease-medium: cubic-bezier(.16, 1, .3, 1);
  --ease-slow: cubic-bezier(.16, 1, .3, 1);
  --duration-fast: 120ms;
  --duration-medium: 180ms;
  --duration-slow: 300ms;
}

[data-theme="light"] {
  --background: #F8FAFC;
  --bg: var(--background);
  --surface1: #F1F5F9;
  --surface2: #E2E8F0;
  --surface3: #CBD5E1;
  --border: #E2E8F0;
  --border-visible: #CBD5E1;
  --text1: #0F172A;
  --text2: #334155;
  --text3: #64748B;
  --text4: #94A3B8;
  --accent: #22C55E;
  --accent-subtle: #F0FDF4;
  --success: #22C55E;
  --success-bg: #F0FDF4;
  --warning: #F59E0B;
  --warning-bg: #FFFBEB;
  --error: #EF4444;
  --error-bg: #FEF2F2;
  --shadow-1: inset 0 1px 0 rgba(255,255,255,.7), 0 1px 2px rgba(15,23,42,.06);
  --shadow-2: inset 0 1px 0 rgba(255,255,255,.8), 0 12px 28px rgba(15,23,42,.12);
  --shadow-3: 0 24px 64px rgba(15,23,42,.18);
}
```

### React / Tailwind Guidance

Use existing `lucide-react` in this repository for React components when available. Set `strokeWidth={1.5}` and `size={16}` to keep the Raycast-like line weight.

```tsx
import { Command, Search } from "lucide-react";

<Search size={16} strokeWidth={1.5} aria-hidden="true" />
```

Use `cn` for class composition and keep existing Tailwind theme variables:

```tsx
<div className="rounded-[12px] border border-border bg-card/90 shadow-sm">
  <div className="flex h-11 items-center gap-3 rounded-md px-3 hover:bg-secondary">
    <Command size={16} strokeWidth={1.5} />
    <span className="text-sm font-medium text-foreground">Run command</span>
    <kbd className="ml-auto rounded px-1.5 py-1 font-mono text-[11px] text-muted-foreground">cmd K</kbd>
  </div>
</div>
```

## 2. SwiftUI / iOS

Use system colors provided by the host app. Do not hardcode Raycast red.

```swift
extension CGFloat {
    static let rayRadiusControl: CGFloat = 8
    static let rayRadiusComponent: CGFloat = 12
    static let rayRadiusContainer: CGFloat = 16
}

extension View {
    func rayGlassSurface() -> some View {
        self
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: .rayRadiusComponent, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: .rayRadiusComponent, style: .continuous)
                    .stroke(.white.opacity(0.10), lineWidth: 1)
            )
    }
}
```

## 3. Implementation Rules

- Read the host theme before styling.
- Use existing semantic colors, not copied Raycast hex values.
- Use 8px grid, 12px cards, 8px controls, 16px shells.
- Use compact command rows for dense workflows.
- Keep animations under 300ms.
