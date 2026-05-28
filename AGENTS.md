# Repository Guidelines

## Project Structure & Module Organization

This is a Vite React/TypeScript frontend for `open-share-frontend`. The app entry is `src/main.tsx`, with routing in `src/app/router.tsx`. Shared app sections and UI primitives live under `src/app/components/`, especially `src/app/components/ui/`. Route-level screens are in `src/pages/`; the Insight feature is grouped under `src/pages/insight/` with `api/`, `components/`, `domain/`, `styles/`, and `types/` subfolders. Common utilities are in `src/lib/`, auth state is in `src/contexts/`, translations are in `src/i18n/locales/`, global styles are in `src/styles/`, and static public assets or markdown agreements are in `public/`.

## Build, Test, and Development Commands

- `npm i`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Vite development server.
- `npm run build`: create a production build with Vite.

There is currently no configured `test`, `lint`, or `format` script. Do not document or rely on one until it is added to `package.json`.

## Coding Style & Naming Conventions

Use TypeScript with React function components and keep `strict` compiler settings clean. Prefer the `@/*` path alias for imports from `src/`. Match nearby style when editing existing files; use 2-space indentation in TSX/JSON and keep changes surgical. Name React components in `PascalCase`, hooks with `use` prefixes, functions and variables in `camelCase`, and page files in kebab case such as `organization-detail.tsx`. Keep reusable Radix/Tailwind UI primitives in `src/app/components/ui/`, and use the existing `cn` helper for class composition.

## Testing Guidelines

No test framework is configured yet. For now, verify changes with `npm run build` and focused manual checks in the Vite app. When adding tests, place them near the related module using a clear `*.test.ts` or `*.test.tsx` pattern and add the matching npm script in the same change.

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit-style messages, for example `feat: add withdrawals comments`, `fix: fix point preview`, and `refactor: change avatar priority`. Use a lowercase type (`feat`, `fix`, `refactor`, etc.) followed by a concise imperative summary.

Pull requests should include a brief description, linked issue when applicable, screenshots or recordings for UI changes, and the verification performed. Keep PRs focused; avoid unrelated refactors or formatting churn.

## Agent-Specific Instructions

Follow the repository’s caution-first workflow: state assumptions for ambiguous work, prefer the minimum code needed, touch only files required by the task, and verify before handing off. Do not revert unrelated local changes.
