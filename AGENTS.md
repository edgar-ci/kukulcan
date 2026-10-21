# Repository Guidelines

## Project Structure & Module Organization

This Spanish-language heat laboratory uses React and Vite. `src/App.jsx` owns navigation and saved progress; `src/components/` contains missions, quizzes, dialogs, and the experiment adapter. Educational text lives in `src/data/`; physics and SVG animation modules live in `src/simulations/`. Shared styles are in `src/style.css`. Tests reside in `tests/`, with browser checks in `tests/browser/`. Implementation plans belong in `docs/superpowers/plans/`.

`dist/` is generated, versioned deployment output used by `.openai/hosting.json`. Edit source files, then rebuild; never patch generated bundles directly.

## Build, Test, and Development Commands

Use Node.js 22.12+ and npm:

- `npm ci`: install locked dependencies.
- `npm run dev`: start the Vite development server.
- `npm run build`: regenerate the production site in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm test`: run Node assertion tests for physics and persistence.
- `npx playwright install chromium`: install the browser for testing.
- `npm run e2e`: build and run browser regressions on port 4173.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, semicolons, and descriptive camelCase identifiers. Name React component files in PascalCase with `.jsx`; use `.js` for models and data. Preserve Spanish interface text and existing CSS classes. No formatter or linter is currently configured. Keep imperative SVG updates inside the experiment adapter; always clean up animation frames, listeners, and observers.

## Testing Guidelines

Use Node's built-in assertions and test runner for `*.test.js`; use Playwright for browser `*.spec.js`. No numeric coverage threshold is configured. Cover conservation laws, boundary temperatures, invalid input, persistence, and changed interactions. Check keyboard operation, reduced motion, and mobile layout when modifying experiments.

## Commit & Pull Request Guidelines

Existing commits use `Update Site source`; no stricter convention is established. Prefer concise imperative summaries describing the change. PRs should explain behavior changes, validation performed, and relevant issues. Include screenshots for visual changes and identify checks not completed.

## Content & Dependency Safeguards

Preserve the `heat-lab-v1` storage format and document scientific assumptions. Do not introduce unfamiliar GitHub repositories or repositories with fewer than 100 stars. Keep contributor explanations brief and actionable.
