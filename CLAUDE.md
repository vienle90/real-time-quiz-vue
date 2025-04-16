# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Development: `pnpm dev` (or npm/yarn/bun)
- Build: `pnpm build`
- Preview: `pnpm preview`
- Generate static: `pnpm generate`

## Lint/Typecheck Commands
- Lint: `pnpm lint`
- Fix linting issues: `pnpm lint:fix`
- Type checking: `pnpm typecheck`

## Code Style Guidelines
- Vue 3 with Composition API and script setup syntax
- TypeScript for type safety (always prefer typed code)
- ESLint for code quality
- Vuetify for UI components with proper indentation
- SCSS for styling (prefer scoped styles in components)
- Component names in PascalCase (e.g., `QuizQuestion.vue`)
- Props should be typed properly with defaults when appropriate
- Use axios for API requests with proper error handling
- Use vue reactivity system (`ref`, `computed`, `watch`) appropriately
- Include proper lifecycle hooks (`onMounted`, etc.)