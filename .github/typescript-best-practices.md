# TypeScript Code Best Practices

This document outlines best practices for writing TypeScript code in production environments, focusing on maintainability, clarity, and type safety.

## Node.js Version

### LTS Version Policy
- **Always use the latest -1 LTS (Long Term Support) version of Node.js**
- For example, if the current LTS is v22, use v22 (not v24 or experimental versions)
- Update your `.nvmrc` or `.node-version` file to reflect this requirement
- Document the Node.js version in your `package.json`:

```json
{
  "engines": {
    "node": ">=22.0.0 <24.0.0"
  }
}
```

### Rationale
- LTS versions provide stability and long-term support
- Using -1 LTS ensures you benefit from the latest stable features while maintaining compatibility
- Standardizing on a single version prevents "works on my machine" issues across the team

## Simplicity First

Simplicity of code is of the highest importance. Prioritize readable and maintainable code over clever or overly sophisticated solutions.

### Principles
- Write code for humans first, computers second
- Avoid unnecessary abstractions and over-engineering
- Choose clarity over conciseness
- Use straightforward logic and clear naming conventions

### Examples

**❌ Avoid - Overly Complex:**
```typescript
const result = data
  .filter(x => x.active)
  .reduce((acc, x) => ({ ...acc, [x.id]: x.name }), {})
  .entries()
  .map(([k, v]) => [parseInt(k), v.toLowerCase()])
  .filter(([k]) => k % 2 === 0);
```

**✅ Prefer - Clear and Simple:**
```typescript
const activeUsers = data.filter(user => user.active);

const result = [];
for (const user of activeUsers) {
  if (user.id % 2 === 0) {
    result.push({
      id: user.id,
      name: user.name.toLowerCase()
    });
  }
}
```

### Readability Guidelines
- Prefer explicit variable names over single letters (except in loops: `for (let i = 0; ...)`)
- Break complex operations into smaller, named functions
- Add comments explaining the "why", not the "what"
- Keep functions focused on a single responsibility
- Avoid deeply nested code; use early returns to reduce nesting

```typescript
// ❌ Avoid: Deeply nested
function processOrder(order: Order): void {
  if (order.items.length > 0) {
    if (order.total > 0) {
      if (order.customer.active) {
        // Process order
      }
    }
  }
}

// ✅ Prefer: Early returns
function processOrder(order: Order): void {
  if (order.items.length === 0) return;
  if (order.total <= 0) return;
  if (!order.customer.active) return;

  // Process order
}
```

## Avoid Using `any`

The `any` type defeats the purpose of TypeScript. Always use explicit, properly typed code instead.

### Why Avoid `any`
- Loses all type safety and IDE assistance
- Makes refactoring dangerous
- Hides bugs that TypeScript could catch
- Reduces code documentation value
- Makes it harder for team members to understand code intent

### Alternatives to `any`

**❌ Don't use `any`:**
```typescript
function handleData(data: any): any {
  return data.value.toString();
}
```

**✅ Use proper typing:**
```typescript
interface DataObject {
  value: string | number;
}

function handleData(data: DataObject): string {
  return String(data.value);
}
```

### Common Scenarios

**For unknown types, use `unknown`:**
```typescript
// Better than any - requires type checking before use
function process(data: unknown): void {
  if (typeof data === 'object' && data !== null) {
    // Now we can safely access properties
  }
}
```

**For flexible object shapes, use generics:**
```typescript
// Instead of: function getData(params: any)
function getData<T extends Record<string, unknown>>(params: T): T {
  return params;
}
```

**For optional properties, use unions or optional fields:**
```typescript
// Instead of: { data: any }
interface Response {
  data: string | number | null;
  metadata?: Record<string, string>;
}
```

**For function parameters with varying types, use overloads:**
```typescript
// Instead of: function convert(value: any)
function convert(value: string): number;
function convert(value: number): string;
function convert(value: string | number): string | number {
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  return value.toString();
}
```

### Strict Type Checking

Enable strict mode in your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "alwaysStrict": true
  }
}
```

## Summary

| Principle | Guideline |
|-----------|-----------|
| **Node.js Version** | Use latest -1 LTS version only |
| **Code Simplicity** | Prioritize clarity and readability over cleverness |
| **Type Safety** | Never use `any`; always use explicit types |

These practices ensure your codebase remains maintainable, type-safe, and easy for the entire team to work with.

## Naming Conventions

Use consistent naming conventions across different parts of your codebase:

| Element | Convention | Example |
|---------|-----------|---------|
| **Code Files** | small-kebab-case | `user-service.ts`, `order-controller.ts` |
| **Postgres Objects** | snake_case | `user_accounts`, `order_items`, `created_at` |
| **JSON Keys** | camelCase | `{ firstName: "John", lastName: "Doe" }` |
| **Environment Variables** | UPPERCASE_WITH_UNDERSCORES | `DATABASE_URL`, `API_KEY`, `LOG_LEVEL` |

### Example
```typescript
// File: user-service.ts
interface UserResponse {
  firstName: string;
  lastName: string;
}

export class UserService {
  async getUser(userId: number): Promise<UserResponse> {
    const user = await database.query(
      `SELECT first_name, last_name FROM user_accounts WHERE id = $1`,
      [userId]
    );
    
    return {
      firstName: user.first_name,
      lastName: user.last_name
    };
  }
}
```

## const vs let

Always default to `const`. Only use `let` when the variable will be reassigned.

### Why Prefer `const`
- Signals intent: the value won't change
- Prevents accidental reassignment
- Makes code more predictable and easier to reason about
- Modern JavaScript tooling optimizes `const` declarations

### Examples

**❌ Avoid - Unnecessary let:**
```typescript
let users = getUserList();
users = users.filter(u => u.active);

let sum = 0;
for (const value of numbers) {
  sum += value;
}
```

**✅ Prefer - Use const:**
```typescript
// Use const for single assignment
const users = getUserList().filter(u => u.active);

// Use reduce instead of reassigning sum
const sum = numbers.reduce((acc, value) => acc + value, 0);

// Use let only when necessary
let counter = 0;
while (counter < 10) {
  console.log(counter);
  counter++;
}
```

## Dependency Injection

Use Dependency Injection with Singleton pattern for injecting dependencies into classes. **Never use the `new` keyword inside classes**. If needed, switch to a Factory pattern.

### Anti-Pattern: Direct Instantiation

**❌ Don't create dependencies inside classes:**
```typescript
export class UserService {
  private database = new Database();  // ❌ Hard to test, tightly coupled
  private emailService = new EmailService();

  async createUser(data: UserData): Promise<User> {
    // Uses directly instantiated dependencies
  }
}
```

### Singleton Pattern

**✅ Use Singleton pattern with dependency injection:**
```typescript
// database.ts - Singleton
export class Database {
  private static instance: Database;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// email-service.ts - Singleton
export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }
}

// user-service.ts
export class UserService {
  constructor(
    private database: Database = Database.getInstance(),
    private emailService: EmailService = EmailService.getInstance()
  ) {}

  async createUser(data: UserData): Promise<User> {
    const user = await this.database.saveUser(data);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}

// Usage
const userService = new UserService();
```

### Factory Pattern

**For more complex scenarios, use Factory pattern:**
```typescript
export class ServiceFactory {
  static createUserService(
    database?: Database,
    emailService?: EmailService
  ): UserService {
    return new UserService(
      database || Database.getInstance(),
      emailService || EmailService.getInstance()
    );
  }
}

// Usage
const userService = ServiceFactory.createUserService();

// Easy to test with mocks
const mockDb = new MockDatabase();
const testUserService = ServiceFactory.createUserService(mockDb);
```

## Unused Imports

Do not import unused packages and types. Remove them before committing code.

**❌ Avoid:**
```typescript
import axios from 'axios';
import { UserDTO } from './types';
import { unused } from './utils';

export async function getUser(id: number) {
  // axios and UserDTO are never used
  return await fetch(`/api/users/${id}`);
}
```

**✅ Do:**
```typescript
export async function getUser(id: number) {
  return await fetch(`/api/users/${id}`);
}
```

Use your IDE's built-in features to detect and remove unused imports automatically.

## String Literals

Use backticks for all string literals. This ensures consistency and enables template literals when needed.

**❌ Avoid - Single and double quotes:**
```typescript
const name = 'John';
const greeting = "Hello, " + name;
const message = 'Welcome to ' + name + "'s service";
```

**✅ Prefer - Backticks everywhere:**
```typescript
const name = `John`;
const greeting = `Hello, ${name}`;
const message = `Welcome to ${name}'s service`;
```

## Explicit Null/Undefined Checks

Avoid truthy checks as they can lead to unexpected behavior. Always write explicit checks for `null`, `undefined`, and `false`.

### Problems with Truthy Checks

**❌ Avoid - Truthy checks are ambiguous:**
```typescript
if (filters.qualifier_id) {
  // What if qualifier_id is 0? (falsy but valid)
  // What if qualifier_id is false? (intentional but falsy)
  // What if qualifier_id is empty string? (falsy but different issue)
}

if (config.count) {
  // If count is 0, this silently skips processing
}

if (user.role) {
  // If role is 'guest' or other falsy value, fails
}
```

**✅ Prefer - Explicit checks:**
```typescript
// For non-null/undefined
if (filters.qualifier_id !== null && filters.qualifier_id !== undefined) {
  // Clear intent
}

// Or use nullish coalescing
if (filters.qualifier_id ?? false) {
  // Only checks for null/undefined
}

// For specific types
if (typeof config.count === 'number' && config.count > 0) {
  // Explicit about type and value
}

if (user.role !== null && user.role !== undefined) {
  // Clear intent for optional values
}
```

## Iteration: for...of vs forEach

Use `for...of` instead of `forEach` because it properly supports `await` in async operations.

### Why for...of is Better

**❌ forEach doesn't wait for async operations:**
```typescript
const userIds = [1, 2, 3];

// This doesn't wait - all requests fire simultaneously
userIds.forEach(async (id) => {
  await fetchUser(id);  // forEach doesn't wait
});

// fetchUser calls are not awaited
console.log('Done'); // Logs immediately, not after all users fetched
```

**✅ for...of properly awaits:**
```typescript
const userIds = [1, 2, 3];

// This waits for each iteration
for (const id of userIds) {
  await fetchUser(id);  // Properly awaited
}

console.log('Done'); // Logs after all users are fetched
```

### Example with Error Handling

```typescript
// Process items sequentially with proper error handling
for (const item of items) {
  try {
    await processItem(item);
  } catch (error) {
    console.error(`Failed to process ${item.id}:`, error);
  }
}
```

## Number Checking and Parsing

Use `Number.isInteger()` for integer validation. It correctly handles `Infinity`, `NaN`, and decimal numbers.

**Reference:** [MDN - Number.isInteger()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger)

### Why Number.isInteger() is Better

**❌ Avoid - Unreliable checks:**
```typescript
const value = '123';

// parseInt can succeed on non-integers
if (!isNaN(parseInt(value))) {
  // This passes for '123.45' which is NOT an integer
}

// Modulo doesn't work reliably with floats
if (value % 1 === 0) {
  // Unexpected behavior with large numbers
}

// typeof doesn't check for valid integers
if (typeof value === 'number') {
  // Includes Infinity and NaN
}
```

**✅ Use Number.isInteger():**
```typescript
const value1 = 123;
const value2 = 123.45;
const value3 = NaN;
const value4 = Infinity;

Number.isInteger(value1);     // true
Number.isInteger(value2);     // false
Number.isInteger(value3);     // false
Number.isInteger(value4);     // false

// Safe parsing pattern
function parseInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }
  
  return null;
}
```

## Object Property Access

Use dot notation for accessing object properties instead of bracket notation with string keys.

**❌ Avoid - Index/bracket accessors:**
```typescript
const user = {
  firstName: 'John',
  lastName: 'Doe'
};

const firstName = user['firstName'];
const name = user['firstName'] + ' ' + user['lastName'];
```

**✅ Prefer - Dot notation:**
```typescript
const user = {
  firstName: 'John',
  lastName: 'Doe'
};

const firstName = user.firstName;
const name = `${user.firstName} ${user.lastName}`;
```

### Exception: Dynamic Keys

Only use bracket notation when property names are dynamic:

```typescript
function getValue(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];  // OK - key is dynamic
}

const data = { [varName]: value };  // OK - computed property
```

## Import Sequence

Organize imports in the following order with blank lines between groups:

1. **Node platform imports** - Built-in Node.js modules
2. **Third-party packages** - From node_modules
3. **Local imports** - Your project files

### Example

```typescript
// Node platform imports
import { createReadStream } from 'fs';
import { join } from 'path';

// Third-party packages
import express from 'express';
import sinon from 'sinon';
import { Pool } from 'pg';

// Local imports
import { UserService } from './services/user-service.js';
import { Database } from './database.js';
import type { User } from './types.js';
```

## Class Formatting

Add one blank line between class members and between the `class` keyword and the first member.

### Example

```typescript
export class UserService {

  private database: Database;
  private emailService: EmailService;

  constructor(
    database: Database = Database.getInstance(),
    emailService: EmailService = EmailService.getInstance()
  ) {
    this.database = database;
    this.emailService = emailService;
  }

  async getUser(id: number): Promise<User | null> {
    return this.database.findUser(id);
  }

  async createUser(data: UserData): Promise<User> {
    const user = await this.database.saveUser(data);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await this.database.deleteUser(id);
  }

}
```

## Summary

| Principle | Guideline |
|-----------|-----------|
| **Node.js Version** | Use latest -1 LTS version only |
| **Code Simplicity** | Prioritize clarity and readability over cleverness |
| **Type Safety** | Never use `any`; always use explicit types |
| **Naming** | Follow conventions: kebab-case (files), snake_case (DB), camelCase (JSON), UPPERCASE (env) |
| **Variables** | Default to `const`, use `let` only for reassignment |
| **Dependencies** | Use Dependency Injection with Singletons, never `new` inside classes |
| **Imports** | Remove unused imports, follow: node → packages → local |
| **Strings** | Always use backticks for consistency |
| **Checks** | Use explicit null/undefined checks, avoid truthy checks |
| **Iteration** | Use `for...of` for async support, avoid `forEach` with await |
| **Numbers** | Use `Number.isInteger()` for integer validation |
| **Objects** | Use dot notation, bracket notation only for dynamic keys |
| **Classes** | Add blank lines between members and after class keyword |

These practices ensure your codebase remains maintainable, type-safe, and easy for the entire team to work with.
