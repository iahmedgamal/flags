Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## **1. Think Before Coding**

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## **2. Simplicity First**

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## **3. Surgical Changes**

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## **4. Goal-Driven Execution**

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

### Styling

## Tailwind with dark mode (`dark:` classes) and high-contrast mode (`high-contrast` class on `<html>`). Both toggled via localStorage keys `theme` and stored via `setStoredIsHighContrastMode`.

## Claude Code Setup (for new devs)

This repo uses **Serena** as an MCP server to give Claude Code LSP-powered symbol search (find references, definitions, usages across the codebase).

### Install Serena

Serena is installed via `uv` (the fast Python package manager):

**Step 1 — Install `uv` if you don't have it:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Step 2 — Install Serena:**

```bash
uv tool install serena-agent
```

**Step 3 — Verify:**

```bash
serena --version
# Should print: Serena 1.x.x
```

**Step 4 — Open the project in Claude Code.**
The `.claude/settings.json` in this repo will automatically connect Serena as an MCP server — no extra config needed.

> If Claude Code doesn't pick it up, run: `claude mcp list` and check that `serena` shows `✓ Connected`.

---

## CSS & Styling

- Tailwind CSS 3.4.17
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:` where applicable

## Code Style Requirements

**TypeScript**:

- Strict typing enabled - no `any` types
- Use TypeScript interfaces for component props with multiple properties
- Avoid `any` type - always provide explicit types
- Use named interfaces for component props instead of inline types.
- inline style os forbidden

**Naming Conventions**:

- Components: PascalCase (`CooksGridView`, `DishCard`, `CuisineHeader`)
- Functions and hooks: camelCase (`useDeliveryDate`, `handleSubmit`, `formatUKDate`)
- Constants: UPPER_SNAKE_CASE (`TABLE_NAMES`, `STORAGE_NAMES`)
- Route paths: kebab-case (`/become-a-chef`, `/cook/dishes/[id]`)

**Import Patterns**:

- Use absolute imports from `@app/`
- Use absolute imports from `@repo/` for shared packages
- Prefer absolute imports (e.g., @/components/..) over relative paths for cleaner code and easier refactoring.
- Group imports: external dependencies, then internal imports

## File size should not exceed 300 line of code

If you are doing small components and the file is growing, please extract this component into a separate file. We want small, readable files.

### TESTING

Every utility should had a unit tests, here is a reference Title.test.tsx
I do use vitest add // Assert , When and Then.

### Symbol Search

When a task involves LSP-capable queries (find all references to a symbol, find symbol definition, find implementations, find all usages of a component/function), ask the user:

> "Search with **Serena (LSP)** or **Grep/Glob**?"

Only offer this choice when the search genuinely benefits from LSP — not for plain text or filename searches.

### ZOD

For Zod schemas, any field that may come from a database or external API must use .nullish() (or .optional().nullable()), never .optional() alone — databases return null, not
undefined.

### Think twice before writing useEffect

Usaully you don't need useEffect it make the code more complex

