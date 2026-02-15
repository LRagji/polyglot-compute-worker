# Copilot Instructions for polyglot-compute-worker

This file guides AI coding agents on the essential patterns, conventions, and workflows for contributing to the polyglot-compute-worker project.

## Project Overview

**polyglot-compute-worker** is a cross-language compute worker framework enabling stateful/stateless workers with structured communications. This TypeScript/Node.js implementation provides the core infrastructure for:
- Worker lifecycle management
- Structured message passing between workers
- State management (both stateful and stateless modes)
- Cross-language worker coordination

## Before You Code

Read these files (in order) to understand this project's specific conventions:
1. **[typescript-best-practices.md](typescript-best-practices.md)** - Code style, naming conventions, dependency injection patterns, and type safety rules
2. **[typescript-node-testing-instructions.md](typescript-node-testing-instructions.md)** - Testing patterns, mocking with Sinon, and C8 coverage configuration

These files are normative - follow them exactly. Deviations require explicit review.

## Key Project Constraints

- **Node.js Version**: Must use latest -1 LTS (currently v22.x). Enforced in `package.json` engines field.
- **Module System**: ES modules (`"type": "module"` in package.json)
- **Test Framework**: Node's built-in `test` runner (no Jest, Mocha, or other frameworks)
- **Mocking**: Sinon only; no other mocking libraries
- **Coverage Target**: 80% minimum for lines, functions, branches, and statements (enforced by C8)
- **Type Safety**: Strict TypeScript mode required; `any` type is forbidden

## Development Workflow

### Building
```bash
npm run build      # Compile src/**/*.ts to dist/**/*.js
npm run clean      # Remove dist/ directory
```

### Testing
```bash
npm test           # Run all tests in test/**/*.test.ts
npm run coverage   # Generate coverage report (HTML at coverage/index.html, LCOV format)
```

Tests must pass with 80%+ coverage before merging.

## File Organization & Naming

```
src/               # Main source code (ES modules, .ts files)
├── index.ts       # Main entry point
├── module.ts      # Individual modules
├── utils.ts      # Utility functions
└── types.ts       # Type definitions

test/              # Test files mirror src/ structure
├── unit/
│   ├── module.test.ts
│   ├── utils.test.ts
│   └── integration/  # Integration tests
└── fixtures/       # Test data and mock helpers

dist/              # Compiled JavaScript (generated, not committed)
```

**Naming Conventions**:
- **Source files**: `small-kebab-case.ts` (e.g., `worker-service.ts`, `message-queue.ts`)
- **PostgreSQL objects**: `snake_case` (columns, tables, functions)
- **JSON keys**: `camelCase` (API responses, config objects)
- **Environment variables**: `UPPERCASE_WITH_UNDERSCORES`
- **Classes**: `PascalCase` (e.g., `WorkerService`, `MessageHandler`)
- **Interfaces**: `small-kebab-case.ts` with `i` prefix (e.g., `i-worker.ts`, `i-message-handler.ts`)
- **Test files**: `*.test.ts` (e.g., `worker-service.test.ts`)

## Code Patterns Required

### Dependency Injection
**Rule**: Never use `new` keyword inside classes. Use Singleton pattern with constructor injection:

```typescript
export class WorkerService {

  constructor(
    private messageQueue: MessageQueue = MessageQueue.getInstance(),
    private database: Database = Database.getInstance()
  ) {}

  async processWorker(): Promise<void> {
    // Use injected dependencies
  }

}
```

Singleton implementations must have `getInstance()` static method.

### Testing
- Test only public interfaces; never access private members directly
- Use `t.after()` to clean up stubs/spies (prevent test pollution)
- Use `for...of` loops for async operations, not `forEach()`
- Use `Number.isInteger()` for integer validation, never `isNaN()` or modulo checks

### String Literals
Always use backticks:
```typescript
const name = `worker-${id}`;  // ✅
const name = 'worker-' + id;  // ❌
```

### Variable Declaration
Default to `const`, use `let` only when reassigning:
```typescript
const config = loadConfig();    // ✅
let counter = 0;
while (counter < 10) counter++; // ✅
```

### Explicit Null Checks
Avoid truthy checks; use explicit conditions:
```typescript
if (workerId !== null && workerId !== undefined) {  // ✅
if (state.count === 0) {                             // ✅
if (filters.qualifier_id) {                          // ❌ fails for 0, false, ""
```

### Import Organization
Group imports with blank lines between groups:
```typescript
// Node platform imports
import { EventEmitter } from 'events';

// Third-party packages
import express from 'express';
import sinon from 'sinon';

// Local imports
import { WorkerService } from './services/worker-service.js';
import type { Worker } from './types.js';
```

### Class Formatting
Add one blank line between members and after `class` keyword:
```typescript
export class WorkerManager {

  private workers: Map<string, Worker> = new Map();

  async registerWorker(worker: Worker): Promise<void> {
    this.workers.set(worker.id, worker);
  }

  async unregisterWorker(id: string): Promise<void> {
    this.workers.delete(id);
  }

}
```

## Architecture Principles

1. **Simplicity First**: Code clarity > cleverness. Refactor complex chains into named steps.
2. **Type Safety**: Never use `any`. Use `unknown` for truly unknown types, generics for flexible shapes.

## Default Behaviors for Implementation

When implementing new features:
- Create a class with dependency injection (no `new` inside classes)
- Write unit tests in `test/unit/` mirroring the source structure
- Each test file pairs with one source file (1:1 mapping)
- Include integration tests in `test/unit/integration/` for cross-component flows
- Ensure 80%+ coverage or explain the uncovered code paths

## Common Patterns in This Project

**Error Handling**: Throw typed errors; catch and log with context before re-throwing upstream.

## Quick Reference

| Task | Command |
|------|---------|
| Add dependency | `npm install <pkg>` |
| Run tests | `npm test` (or with watch: `node --test test/**/*.test.ts --watch`) |
| Check coverage | `npm run coverage` then open `coverage/index.html` |
| Compile | `npm run build` |
| Type check | `npm run build` (also performs type check) |

## Getting Help

When uncertain:
1. Check the relevant instruction file (best-practices or testing-instructions)
2. Review existing patterns in `src/` and `test/unit/` directories
3. Refer to [Node.js Test API docs](https://nodejs.org/api/test.html)
4. Check [Sinon documentation](https://sinonjs.org/) for mocking patterns

