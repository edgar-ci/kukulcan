# React and Vite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Migrate the existing heat laboratory to React and Vite without changing educational content or interactions.

**Architecture:** React owns navigation, progress, quizzes and dialogs. Existing SVG animation engines become ES modules mounted inside an isolated React component with explicit cleanup; physics remains independently testable.

**Tech Stack:** React, Vite, JavaScript, CSS, Node assertions, Playwright.

**Spec:** User request: “migra la aplicacion a react con vite”; existing behavior documented in README.md.

## Global Constraints
- Preserve Spanish content, all seven missions, accessibility and the `heat-lab-v1` storage contract.
- Keep `dist` as generated hosting output; move editable sources into `src`.
- Use established dependencies, no external repository templates.

## Review Focus
- Existing progress and malformed/unavailable localStorage: unit and browser tests.
- Navigation during animation: browser tests and lifecycle cleanup.
- Dialog controls rendered asynchronously: React state, browser converter and materials tests.
- Reduced motion and keyboard operation: browser checks.
- Responsive layout and final quiz completion: browser checks.

### Task 1: Source and build setup
- [x] Move content and physics into ES modules; adapt existing Node tests.
- [x] Add package.json, Vite configuration, root HTML and React entry.
- [x] Run physics tests and production build.

### Task 2: React application
- [x] Create App, Mission, Experiment, dialogs and FinalQuiz components.
- [x] Preserve storage format; test invalid input and storage failures.
- [x] Use explicit scene roots and cleanup; eliminate window exports.
- [x] Add browser regression checks for missions, dialogs, progress and mobile.

### Task 3: Documentation and validation
- [x] Update README and create AGENTS.md only if absent.
- [x] Run unit tests, browser checks and production build; inspect changes.

## Validation results

- Production build passed with Vite 8.3.4 and React 19.3.1.
- Five Node tests passed, including the existing physics assertions.
- Five Chromium browser tests passed against the production build: seven missions, final quiz, persistence/reset, dialogs, converter, material sorting, keyboard controls, animation navigation, reduced motion and mobile layout.
- Generated `dist/` remains versioned for the existing hosting workflow; no deployment was performed.
