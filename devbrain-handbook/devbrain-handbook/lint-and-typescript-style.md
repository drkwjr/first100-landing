# ESLint & TypeScript Style Bible

**Purpose**: This document is the single source of truth for lint and TypeScript standards in this codebase. It defines what we allow, what we forbid, and exactly how to handle exceptions. All new code must follow these standards.

**Last Updated**: 2025-11-26

---

## Table of Contents

1. [Global Principles](#global-principles)
2. [Non-Negotiable Rules](#non-negotiable-rules)
3. [Common Failure Patterns & Prevention](#common-failure-patterns--prevention)
4. [Allowable Exceptions](#allowable-exceptions)
5. [Per-Domain Guidance](#per-domain-guidance)
6. [Common Patterns](#common-patterns)
7. [Anti-Patterns](#anti-patterns)
8. [When You Hit a TS/ESLint Error (Playbook)](#when-you-hit-a-tseslint-error-playbook)

---

## Global Principles

### Core Tenets

1. **Zero lint and TypeScript errors AND warnings on main branch**
   - TypeScript compilation (`tsc -b`) must succeed with zero errors
   - ESLint must pass with zero errors and zero warnings
   - No `@ts-ignore` or `@ts-expect-error` without documented rationale
   - CI will fail if any new lint/TS issues are introduced

2. **No unhandled promise rejections**
   - All async functions must handle errors
   - Use try/catch or `.catch()` for promise chains

3. **Prefer explicit domain types over `any`**
   - Use domain types from `src/lib/types/` or co-located type definitions
   - When shape is uncertain, use `unknown` + runtime validation

4. **No unused variables in production code**
   - Remove truly unused code
   - Prefix intentionally unused parameters with `_`

5. **No raw `console.*` usage in production code**
   - Use the shared `Logger` class for structured logging
   - Use `process.stdout.write()` or `process.stderr.write()` for CLI tools
   - Exception: `logger.ts` is the logger implementation and may use `console.log` internally (documented in ESLint config)

6. **React hooks dependencies must be complete**
   - Missing dependencies cause stale closures and bugs
   - Document intentional omissions with comments

---

## Non-Negotiable Rules

These rules are **always errors** in production code. No exceptions without documented rationale.

### TypeScript Rules

#### `@typescript-eslint/no-explicit-any` (ERROR in production)

**What it means**: Never use `any` type in production code.

**Why**: `any` disables type checking and defeats the purpose of TypeScript.

**What to do instead**:
- Use domain types: `CalculatorInput`, `CalculationResult`, `User`, etc.
- Use `unknown` + runtime validation when shape is uncertain
- Create proper interfaces for API responses

**Example - BAD**:
```typescript
function processData(data: any): any {
  return data.value;
}
```

**Example - GOOD**:
```typescript
interface ProcessedData {
  value: number;
  timestamp: Date;
}

function processData(data: unknown): ProcessedData {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return {
      value: Number(data.value),
      timestamp: new Date(),
    };
  }
  throw new Error('Invalid data shape');
}
```

#### `@typescript-eslint/no-unused-vars` (ERROR in production)

**What it means**: No unused variables, imports, or parameters.

**Why**: Unused code indicates dead code, incomplete implementations, or copy-paste errors.

**What to do instead**:
- Remove truly unused code
- Prefix intentionally unused parameters with `_`: `_context`, `_ruleData`
- Remove unused imports

**Example - BAD**:
```typescript
function calculate(input: CalculatorInput, context: CalculationContext, ruleData: RuleData) {
  // context and ruleData are never used
  return input.principal * input.rate;
}
```

**Example - GOOD**:
```typescript
function calculate(input: CalculatorInput, _context: CalculationContext, _ruleData: RuleData) {
  // Parameters required by interface but not used in this implementation
  return input.principal * input.rate;
}
```

#### `@typescript-eslint/no-require-imports` / `@typescript-eslint/no-var-requires` (ERROR in production)

**What it means**: Use ES module `import` syntax, not CommonJS `require()`.

**Why**: Consistent module system, better tree-shaking, TypeScript compatibility.

**What to do instead**:
- Use `import` statements
- For dynamic imports, use `import()` function

**Example - BAD**:
```typescript
const fs = require('fs');
const path = require('path');
```

**Example - GOOD**:
```typescript
import fs from 'fs';
import path from 'path';

// Or for dynamic imports:
const module = await import('./dynamic-module');
```

#### `no-console` (ERROR in production)

**What it means**: Never use `console.log`, `console.error`, `console.warn`, etc. in production code.

**Why**: Raw console usage bypasses structured logging, makes log filtering difficult, and prevents proper log aggregation in production environments.

**What to do instead**:
- **For structured logging**: Use the `Logger` class from `backend/src/pipelines/rule-harvest/lib/logger.ts`
- **For CLI tools**: Use `process.stdout.write()` for normal output, `process.stderr.write()` for errors
- **Exception**: `logger.ts` itself may use `console.log` internally (this is the single documented exception, configured in ESLint)

**Example - BAD**:
```typescript
console.log('Processing data...');
console.error('Failed to process:', error);
```

**Example - GOOD (Structured Logging)**:
```typescript
import { Logger } from '../lib/logger.js';

const logger = new Logger('MyComponent', runId);
logger.info('Processing data...');
logger.error(`Failed to process: ${error.message}`);
```

**Example - GOOD (CLI Tool)**:
```typescript
process.stdout.write('Processing data...\n');
process.stderr.write(`Error: ${error.message}\n`);
```

**Exception Pattern**:
```typescript
// Only in backend/src/pipelines/rule-harvest/lib/logger.ts
// ESLint override configured in backend/eslint.config.mjs
console.log(line.trim()); // This is the logger implementation itself
```

#### `@typescript-eslint/prefer-const` (ERROR)

**What it means**: Use `const` for variables that are never reassigned.

**Why**: Prevents accidental reassignment, clearer intent.

**Example - BAD**:
```typescript
let result = calculate(input);
result = formatResult(result);
```

**Example - GOOD**:
```typescript
const result = calculate(input);
const formatted = formatResult(result);
```

### React Rules

#### `react-hooks/exhaustive-deps` (ERROR in production)

**What it means**: All dependencies used in hooks must be listed in dependency arrays.

**Why**: Missing dependencies cause stale closures, bugs, and unexpected behavior.

**What to do instead**:
- List all dependencies
- Use `useCallback`/`useMemo` to stabilize function references
- Document intentional omissions with comments

**Example - BAD**:
```typescript
function Component({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchUserData(userId).then(setData);
  }, []); // Missing userId dependency!
}
```

**Example - GOOD**:
```typescript
function Component({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchUserData(userId).then(setData);
  }, [userId]); // Correct dependency list
}
```

**Example - INTENTIONAL OMISSION**:
```typescript
function Component({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
  
  // Only fetch on mount, ignore userId changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUserData(userId).then(setData);
  }, []);
}
```

---

## Common Failure Patterns & Prevention

This section is intentionally practical: it describes the **most common ways** TS/ESLint regressions show up in this repo, and the **preferred prevention pattern** for each.

### React hook dependency errors (`react-hooks/exhaustive-deps`)

- **Root cause**: stale closures from missing dependencies, especially when callbacks are created inline.
- **Prevention pattern**:
  - Make dependencies explicit first (list everything referenced).
  - If the dependency list is “too noisy”, stabilize the values:
    - Wrap callbacks in `useCallback`
    - Wrap derived values in `useMemo`
- **Allowed escape hatch**: `eslint-disable-next-line react-hooks/exhaustive-deps` is only allowed with a one-line explanation of the invariant being relied on (why ignoring deps is safe).

### `any` creep (`@typescript-eslint/no-explicit-any`)

- **Root cause**: typing uncertainty at system boundaries (API payloads, DB rows, webhooks, third-party SDK objects).
- **Prevention pattern**:
  - Treat external inputs as `unknown`.
  - Validate/narrow at the boundary (schema validation or type guards).
  - Convert to explicit domain types before passing deeper into the system.
- **Not allowed**:
  - “Just make it compile” `any`
  - Unchecked casts like `as any` or `as unknown as SomeType`

### Unused vars/imports (`@typescript-eslint/no-unused-vars`)

- **Root cause**: refactors leaving dead code, or “future use” placeholders.
- **Prevention pattern**:
  - Delete unused imports and locals immediately.
  - If a parameter is required by an interface/handler signature but unused, prefix with `_` right away (e.g. `_req`, `_context`, `_ruleData`).

### Console usage (`no-console`)

- **Root cause**: debug logging left behind, or using console for runtime error reporting.
- **Prevention pattern**:
  - Backend/services: use `Logger` (structured logging).
  - CLI tools: use `process.stdout.write()` / `process.stderr.write()`.
  - Frontend UI flows: handle errors via UI state (e.g. `setError(...)`) or your existing user-facing notification/toast pattern.
- **Hard rule**: do not disable `no-console`. The only exception remains the logger implementation file itself (see ESLint config override).

### Empty `catch` blocks / swallowed errors (`no-empty`)

- **Root cause**: placeholder error handling that hides failures and causes downstream undefined behavior.
- **Prevention pattern**:
  - If an error is truly ignorable, document why and set a safe fallback.
  - Otherwise: log (via Logger / structured mechanism) and either return a typed error or rethrow.

### JSX component typing errors (e.g. `TS2786`)

- **Root cause**: duplicate/mismatched React type trees (multiple versions of `react`, `react-dom`, `@types/react`, `@types/react-dom`) or workspace TypeScript mismatch.
- **Prevention pattern**:
  - Keep a **single React type tree** across the workspace (lock versions; dedupe dependencies).
  - Ensure the editor uses the workspace TypeScript version (not a global TS install).
  - Fix the dependency graph (overrides/resolutions + clean install) rather than “casting around” the error.

---

## Allowable Exceptions

These exceptions are allowed **only** when documented with inline comments explaining why.

### File-Level Suppressions

**When**: A file has a legitimate, architectural reason to violate a rule consistently.

**How**: Add a file-level comment at the top explaining the rationale.

**Example**:
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This file handles Stripe webhook events which have dynamic payload types.
 * We use `any` here because Stripe's event types are not fully typed in their SDK,
 * and we validate the shape at runtime before processing.
 */
```

### Inline Suppressions

**When**: A specific line has a legitimate exception.

**How**: Use `eslint-disable-next-line` with a comment explaining why.

**Example**:
```typescript
// Stripe webhook payloads are dynamically typed - validate at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const event: Stripe.Event = req.body;
```

### Acceptable `any` Usage

**1. Stripe Webhook Events**
```typescript
// Stripe webhook events have dynamic payloads - validate shape at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const payload: any = req.body;
if (!isValidStripeEvent(payload)) {
  return res.status(400).json({ error: 'Invalid event' });
}
const typedEvent = payload as Stripe.Event;
```

**2. Legacy API Compatibility**
```typescript
// Legacy API response format - convert to new format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertLegacyResponse(response: any): CalculatorResponse {
  // Runtime validation and conversion
  return standardizeCalculatorOutput(response);
}
```

**3. Dynamic Rule Data Parsing**
```typescript
// Rule data comes from external JSON - validate with schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRuleData(raw: any): RuleData {
  const validated = ruleDataSchema.parse(raw);
  return validated;
}
```

### Acceptable Unused Parameters

**1. Interface Compliance**
```typescript
// Function signature required by interface, but this implementation doesn't use all params
function calculate(
  input: CalculatorInput,
  _context: CalculationContext,  // Required by interface, unused here
  _ruleData: RuleData            // Required by interface, unused here
): CalculationResult {
  return { result: input.value * 2 };
}
```

**2. Event Handlers**
```typescript
// Event handler signature requires event parameter, but we don't use it
function handleClick(_event: React.MouseEvent) {
  doSomething();
}
```

---

## Per-Domain Guidance

### Calculators (`src/lib/*-calculator.ts`)

**Types**:
- Use `CalculatorInput` from domain types
- Use `CalculationResult` for return values
- Use `CalculationContext` for context
- Use `RuleData` for rule-specific data

**Patterns**:
```typescript
import { CalculatorInput, CalculationResult, CalculationContext, RuleData } from '@/lib/types';

export function calculateInterest(
  input: CalculatorInput,
  context: CalculationContext,
  ruleData: RuleData
): CalculationResult {
  // Implementation
}
```

**Avoid**:
- `any` types for inputs or outputs
- Unused parameters (prefix with `_` if required by interface)
- Hard-coded values (use ruleData)

### API Routes (`src/pages/api/**`)

**Types**:
- Use Next.js `NextApiRequest` and `NextApiResponse`
- Define request/response types explicitly
- Use runtime validation for request bodies

**Patterns**:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

interface CalculateRequest {
  calculatorId: string;
  inputs: CalculatorInput;
}

interface CalculateResponse {
  result: CalculationResult;
  warnings?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CalculateResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Validate request body
  const body = req.body as CalculateRequest;
  if (!body.calculatorId || !body.inputs) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  // Process and return typed response
  const result = await calculate(body.inputs);
  return res.status(200).json({ result });
}
```

**Avoid**:
- `any` for request/response bodies
- Unhandled promise rejections
- Missing error handling

### React Components (`src/components/**`)

**Types**:
- Define prop types explicitly
- Use `React.FC` or explicit return types
- Type event handlers properly

**Patterns**:
```typescript
interface CalculatorInputsProps {
  calculatorId: string;
  inputs: CalculatorInput;
  onChange: (inputs: CalculatorInput) => void;
  onSubmit: () => void;
}

export function CalculatorInputs({
  calculatorId,
  inputs,
  onChange,
  onSubmit,
}: CalculatorInputsProps) {
  // Implementation
}
```

**Hooks**:
```typescript
function useCalculator(calculatorId: string) {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const calculate = useCallback(async (inputs: CalculatorInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/calculators/${calculatorId}/calculate`, {
        method: 'POST',
        body: JSON.stringify({ inputs }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      // Frontend: handle errors via UI state / user-facing notifications (not raw console).
      setError('Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [calculatorId]); // Correct dependency list
  
  return { result, loading, error, calculate };
}
```

**Avoid**:
- Missing hook dependencies
- `any` for props or state
- Unused props (remove or prefix with `_`)

### Tests (`**/__tests__/**`, `**/*.test.ts`)

**Relaxed Rules**:
- `@typescript-eslint/no-explicit-any`: Warning only (but prefer typed fixtures)
- `@typescript-eslint/no-unused-vars`: Warning only (test setup, mocks)

**Patterns**:
```typescript
import { createCalculatorInput, createCalculationResult } from '@/test-utils/fixtures/calculator-fixtures';

describe('calculateInterest', () => {
  it('calculates interest correctly', () => {
    const input = createCalculatorInput({ principal: 1000, rate: 0.05 });
    const result = calculateInterest(input, createContext(), createRuleData());
    expect(result.results.interest).toBe(50);
  });
});
```

**Avoid**:
- Using `any` when typed fixtures exist
- Unnecessary `any` in mocks (use proper types)

---

## Common Patterns

### Runtime Validation with `unknown`

```typescript
function parseApiResponse(data: unknown): ApiResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response format');
  }
  
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.value !== 'number') {
    throw new Error('Missing or invalid value');
  }
  
  return {
    value: obj.value,
    timestamp: obj.timestamp ? new Date(String(obj.timestamp)) : new Date(),
  };
}
```

### Stable Callbacks with `useCallback`

```typescript
function Component({ onSave }: { onSave: (data: Data) => void }) {
  const [value, setValue] = useState('');
  
  // Stabilize callback to prevent unnecessary re-renders
  const handleSubmit = useCallback(() => {
    onSave({ value });
  }, [value, onSave]); // All dependencies listed
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Intentional Unused Parameters

```typescript
// Required by interface but not used in this implementation
function calculateSimple(
  input: CalculatorInput,
  _context: CalculationContext,  // Prefix with _ to indicate intentional
  _ruleData: RuleData
): CalculationResult {
  return { result: input.value * 2 };
}
```

---

## Anti-Patterns

### ❌ Using `any` "just to make it compile"

```typescript
// BAD
function process(data: any) {
  return data.value;
}
```

**Fix**: Use `unknown` + validation or proper types.

### ❌ Missing Hook Dependencies

```typescript
// BAD
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId!
```

**Fix**: Add all dependencies or document why they're omitted.

### ❌ Unused Variables Without Prefix

```typescript
// BAD
function calculate(input: CalculatorInput, context: CalculationContext) {
  // context never used
  return input.value * 2;
}
```

**Fix**: Prefix with `_` or remove if truly unused.

### ❌ Suppressing Rules Without Explanation

```typescript
// BAD
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = req.body;
```

**Fix**: Add comment explaining why the exception is necessary.

---

## Summary Checklist

Before submitting code, ensure:

- [ ] No `any` types in production code (use `unknown` + validation or proper types)
- [ ] No unused variables (remove or prefix with `_`)
- [ ] All React hook dependencies are listed
- [ ] All `require()` statements converted to `import`
- [ ] All `let` variables that aren't reassigned changed to `const`
- [ ] All exceptions documented with inline comments
- [ ] TypeScript compilation succeeds (`yarn tsc -b`)
- [ ] Lint passes (`yarn lint`)

---

## When You Hit a TS/ESLint Error (Playbook)

This is the default response pattern. It is intentionally strict to prevent regressions.

1. **Read the error literally**
   - Don’t immediately add `any`, casts, or suppressions.
2. **Fix the cause, not the symptom**
   - Type mismatch: adjust types or validate/narrow `unknown` at the boundary (don’t “cast around it”).
   - Unused vars: delete or prefix `_` (don’t turn the rule off).
   - Hook deps: list deps or refactor with `useCallback`/`useMemo` (don’t blindly disable).
   - Console usage: replace with Logger / stdout-stderr / UI error state.
3. **Re-run the relevant quality gates**
   - Frontend: `cd frontend && npm run quality`
   - Backend: `cd backend && npm run lint && npm run build`
   - Monorepo: `yarn lint` and `yarn tsc -b` (when shared types/configs are touched)
4. **Only if truly necessary: document a narrow exception**
   - Use the smallest scope possible (single line > block > file).
   - Add a rationale comment explaining the why and the expected follow-up.

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [Project Testing Strategy](./test-strategy.md)
- [Project Coding Style](./coding-style.md)

