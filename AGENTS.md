# Agent Development Guide (AGENTS.md)

This document serves as the authoritative source of truth for AI agents and developers working on the `olympics-2026` repository.
Adherence to these guidelines is mandatory to ensure consistency, reliability, and maintainability as the project scales.

## 1. Project Context & Environment

- **Repository State**: Early-stage/Greenfield.
- **Package Manager**: `pnpm` (version 10.x).
- **Language**: TypeScript (NodeNext module resolution).
- **Tooling**:
  - **Build**: TypeScript (`tsc`).
  - **Linting/Formatting**: Biome (`@biomejs/biome`).
  - **Testing**: Vitest (To be installed/configured).

### Directory Structure

```
olympics-2026/
├── src/            # Source code (entry: index.ts)
├── tests/          # Test files (colocated *.test.ts preferred for units)
├── package.json    # Dependencies and scripts
├── tsconfig.json   # Strict TypeScript configuration
└── AGENTS.md       # This file
```

## 2. Operational Commands

Agents must utilize `pnpm` for all package operations.

### Setup & Maintenance

- **Install Dependencies**: `pnpm install`
- **Clean Install**: `rm -rf node_modules && pnpm install`

### Build & Verification

- **Type Check**: `pnpm tsc:check` (Runs `tsc --noEmit`). _Always run this before committing._
- **Build**: `pnpm build` (Compiles to `dist/`).
- **Lint & Format (Check)**: `pnpm biome:check` (Checks for linting and formatting issues).
- **Lint & Format (Fix)**: `pnpm biome check --write .` (Auto-fixes formatting and simple lint errors).

### Testing

_Note: The project is currently configured with a placeholder test script. If adding tests for the first time, ensure Vitest is installed: `pnpm add -D vitest`._

- **Run All Tests**: `pnpm vitest run` (Requires script update in package.json)
- **Run Single Test File**: `pnpm vitest run src/path/to/file.test.ts`
- **Watch Mode**: `pnpm vitest`
- **Coverage**: `pnpm vitest run --coverage`

## 3. Code Style & Standards

### TypeScript Configuration

The project uses **Strict Mode** with additional safety checks enabled in `tsconfig.json`:

- `noUncheckedIndexedAccess`: Accessing array indices/map keys returns `T | undefined`. Handle it!
- `exactOptionalPropertyTypes`: Do not assign `undefined` to optional properties; omit them instead.

### Naming Conventions

- **Files/Directories**: `kebab-case` (e.g., `user-profile.ts`, `data-processing/`).
- **Variables/Functions**: `camelCase` (e.g., `fetchUserData`, `isValid`).
- **Classes/Interfaces/Types**: `PascalCase` (e.g., `UserResponse`, `HttpRequest`).
- **Constants**: `UPPER_SNAKE_CASE` (only for true primitives/globals, e.g., `MAX_RETRY_COUNT`).
- **Booleans**: Prefix with `is`, `has`, `should` (e.g., `isVisible`, `hasPermission`).

### Imports

Organize imports in groups separated by a blank line:

1.  **Node Built-ins**: `import { readFileSync } from "node:fs";` (Always use `node:` prefix).
2.  **External Packages**: `import { z } from "zod";`
3.  **Internal Modules**: `import { helper } from "./helper.js";` (Note: `nodenext` requires `.js` extensions for relative imports in some configs, check local behavior. If using bundlers, extensions might be omitted, but standard Node ESM requires them. Follow existing patterns).

### Typing Rules

- **No `any`**: Strictly forbidden. Use `unknown` or generics. Never use `any`.
- **Explicit Returns**: Exported functions must have explicit return types.
- **Type Definitions**:
  - Use `interface` for extendable object structures (API responses, class contracts).
  - Use `type` for unions, intersections, and primitives.
- **Async**: Always prefer `async/await` over promise chaining (`.then()`).

### Error Handling

- **Typed Exceptions**: Do not throw strings. Throw `Error` or custom subclasses.
- **Fail Fast**: Validate inputs at the boundary (function start).
- **Context**: When catching errors, wrap them with context if re-throwing.
  ```typescript
  try {
    await db.connect();
  } catch (error) {
    throw new Error(`Database connection failed: ${(error as Error).message}`);
  }
  ```

## 4. Agent Workflow Protocol

When you (the agent) are tasked with writing code, follow this strict loop:

1.  **Explore & Validate**:
    - Read `package.json` to check for new dependencies.
    - Run `pnpm tsc:check` to ensure the codebase is clean before you start.

2.  **Implementation Strategy**:
    - Break tasks into small files. Avoid monolithic files (> 200 lines).
    - If a library is needed, check `package.json` first. Do not hallucinate availability.
    - If installing a new library, explain _why_ it is necessary.

3.  **Test-Driven Mindset**:
    - Since this is a fresh repo, **you are responsible for creating the test infrastructure**.
    - If creating a new feature (e.g., `math-utils.ts`), create `math-utils.test.ts` immediately.
    - Use `pnpm vitest run path/to/new/test.ts` to verify your specific changes.

4.  **Refinement**:
    - Run `pnpm biome check --write .` to format your code.
    - Run `pnpm tsc:check` to catch strict null checks or implicit anys.
    - Ensure no unused imports remain.

5.  **Commit Message Format**:
    - Use Conventional Commits.
    - `feat: add user login logic`
    - `fix: resolve null pointer in parser`
    - `chore: update build scripts`
    - `docs: update readme`

## 5. Specific Guidelines for Tools

### Biome

- We use Biome for both linting and formatting.
- Do not use Prettier or ESLint commands; they are superseded by Biome.
- Configuration is handled via defaults or `biome.json` (if present).

### Playwright (If Applicable)

- Use `pnpm exec playwright test` for E2E scenarios.
- Keep E2E tests in a separate `e2e/` directory, distinct from unit tests.

### File System Operations

- **Paths**: Always use absolute paths when using tool definitions.
- **Creation**: Ensure directory structures exist before writing files.

---

_Generated for olympics-2026. This file defines the operational contract for AI agents._
