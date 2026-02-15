# TypeScript Node Testing Framework Instructions

This document provides guidelines and best practices for TypeScript projects using Node's testing framework, Sinon for mocking, and C8 for code coverage reporting.

## Project Structure

```
src/
├── index.ts              # Main entry point
├── module.ts             # Library modules
├── utils.ts
└── types.ts              # TypeScript type definitions

test/
├── unit/                 # Unit tests
│   ├── module.test.ts
│   ├── utils.test.ts
│   └── integration/      # Integration tests
├── fixtures/             # Test data and mocks
│   ├── data.json
│   └── stubs.ts
└── setup.ts              # Test setup and helpers
```

## Testing Conventions

### Test File Naming
- Test files should end with `.test.ts` or `.spec.ts`
- Place tests alongside source files in a `test/` directory, mirroring the `src/` structure
- Example: `src/module.ts` → `test/unit/module.test.ts`

### Test Structure
```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import sinon from 'sinon';
import { MyClass } from '../src/myModule.js';

test('MyClass', async (t) => {
  await t.test('should do something', () => {
    const instance = new MyClass();
    assert.ok(instance);
  });

  await t.test('should handle errors', () => {
    assert.throws(
      () => { throw new Error('test'); },
      /test/
    );
  });
});
```

### Test Best Practices
- Use descriptive test names that clearly state what is being tested
- Keep tests focused and test one behavior per test case
- Use `t.before()` and `t.after()` hooks for setup and teardown
- Group related tests using nested test suites with `await t.test()`
- Use `async/await` for asynchronous tests
- Always clean up stubs, spies, and mocks after each test
- **Do not access private class member variables directly in unit tests**. Test the public interface only. If you need to test private behavior, consider refactoring the code to expose that behavior through public methods or using a different testing strategy.

## Mocking with Sinon

### Stub Usage
```typescript
import sinon from 'sinon';
import { externalService } from '../src/services.js';

test('stub external calls', async (t) => {
  const stub = sinon.stub(externalService, 'fetch').resolves({ data: 'mocked' });

  await t.after(() => {
    stub.restore();
  });

  // Test code using stub
});
```

### Spy Usage
```typescript
const spy = sinon.spy(obj, 'method');

// Verify the method was called
assert.strictEqual(spy.callCount, 1);
assert.deepEqual(spy.firstCall.args, [expectedArg]);

spy.restore();
```

### Mock Usage
```typescript
const mock = sinon.mock(obj);
mock.expects('method').once().withArgs(expectedArg);

// Test code
mock.verify(); // Verify expectations
mock.restore();
```

### Sinon Best Practices
- Always call `.restore()` in `t.after()` to prevent test pollution
- Use `sinon.createSandbox()` for complex test suites to manage multiple stubs/spies
- Prefer stubs over mocks for simpler scenarios
- Use proper type annotations with `@types/sinon` for TypeScript support

```typescript
import sinon from 'sinon';

test('using sandbox', async (t) => {
  const sandbox = sinon.createSandbox();

  await t.after(() => {
    sandbox.restore();
  });

  const stub = sandbox.stub(obj, 'method').returns('stubbed');
  const spy = sandbox.spy(obj, 'other');

  // All stubs/spies cleaned up with sandbox.restore()
});
```

## Code Coverage with C8

### Configuration
Add a `coverage` script in `package.json`:
```json
{
  "scripts": {
    "test": "node --test 'test/**/*.test.ts'",
    "coverage": "c8 node --test 'test/**/*.test.ts'"
  }
}
```

### C8 Configuration (.c8rc.json or package.json)
```json
{
  "c8": {
    "all": true,
    "include": ["src/**/*.ts"],
    "exclude": [
      "**/*.d.ts",
      "node_modules/",
      "dist/"
    ],
    "reporter": ["text", "html", "lcov"],
    "lines": 80,
    "functions": 80,
    "branches": 80,
    "statements": 80,
    "skip-full": false
  }
}
```

### Coverage Thresholds
- **Lines**: Minimum 80% coverage required
- **Functions**: Minimum 80% coverage required
- **Branches**: Minimum 80% coverage required
- **Statements**: Minimum 80% coverage required

### Running Coverage
```bash
# Generate coverage report
npm run coverage

# View HTML coverage report
open coverage/index.html  # macOS
start coverage/index.html  # Windows
```

### Coverage Best Practices
- Aim for at least 80% coverage for production code
- Don't aim for 100% coverage unnecessarily (diminishing returns)
- Exclude test helpers, fixtures, and generated code using the `exclude` option
- Review uncovered branches to understand what scenarios aren't tested
- Use coverage reports to identify critical paths needing more testing

## TypeScript Compilation

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "test", "dist"]
}
```

### Compilation for Tests
- Use TypeScript loader or transpiler (tsx, ts-node, or similar) for running tests directly
- Or compile to JavaScript before running tests
- Configure test script to handle TypeScript appropriately

## Test Assertions

### Common Assertions
```typescript
import assert from 'node:assert/strict';

// Equality
assert.strictEqual(actual, expected);
assert.deepEqual(obj1, obj2);

// Truthiness
assert.ok(value);
assert.throws(() => { /* code */ });
assert.rejects(async () => { /* code */ });

// Type checking
assert.strictEqual(typeof value, 'string');
assert.match(string, /pattern/);
```

## Running Tests

### Development
```bash
# Run all tests
npm test

# Run specific test file
node --test test/unit/lib/module.test.ts

# Watch mode (requires a watcher package)
npm run test:watch
```

### CI/CD
- Run full test suite with coverage in CI pipelines
- Generate coverage reports for code review
- Fail builds if coverage falls below thresholds
- Archive coverage reports as artifacts

## Common Patterns

### Testing Async Functions
```typescript
test('async function', async (t) => {
  const result = await someAsyncFunction();
  assert.strictEqual(result, expected);
});
```

### Testing Error Cases
```typescript
test('error handling', async (t) => {
  await assert.rejects(
    () => functionThatThrows(),
    /error message/
  );
});
```

### Stubbing Dependencies
```typescript
test('with dependencies', async (t) => {
  const stub = sinon.stub(dependency, 'method').returns('mocked');
  
  await t.after(() => {
    stub.restore();
  });

  const result = await functionThatUsesDependency();
  assert.strictEqual(result, 'expected');
});
```

## Resources

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Sinon Documentation](https://sinonjs.org/)
- [C8 Coverage Reporter](https://github.com/bcoe/c8)
- [Node assert/strict Module](https://nodejs.org/api/assert.html)
