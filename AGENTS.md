# 🧭 Engineering Rules & Workflow Directives
<!-- Configured for: Denmhar Dimaculangan Portfolio & Web Applications -->

This document establishes the mandatory operational workflow, quality guardrails, and architectural rules for all AI code generation, refactoring, and code review in this workspace.

---

## 🛠️ The Core 9 Toolset & Execution Standards

### 1. SkillSpector — Repository Scanning & Skills Standards
- **Pre-Flight Reconnaissance**: Never propose or execute modifications blindly. Always inspect existing architecture, naming conventions, design tokens, and script lifecycles first.
- **Contract & Scope Verification**: Inspect imports, DOM IDs, and dependencies before modifying code to prevent breaking established contracts.
- **Hygiene & Dead Code Elimination**: Detect and eliminate untracked artifacts, unused CSS classes, orphaned scripts, and stale IDs. Maintain spotless directory structure.
- **Metadata Alignment**: Ensure all skills, tools, and code assets expose clear, typed inputs, explicit outputs, and comprehensive documentation comments.

### 2. Reticle — Focused Code Execution & Formatting Guidelines
- **Surgical Target Identification**: Pinpoint the exact line ranges, functions, or CSS rules requiring change. Do not touch adjacent or unrelated blocks.
- **Style Coherence**: Match the existing repository format without deviation:
  - 2-space indentation for HTML, CSS, and JS.
  - Double quotes for HTML attributes and JS strings (matching current codebase conventions).
  - Kebab-case for CSS classes and data attributes; camelCase for JavaScript variables and functions; UPPER_SNAKE_CASE for constants.
- **Zero Side-Effects**: Preserve existing event handlers, analytics, accessibility tags, and DOM queries when modifying adjoining logic.

### 3. Chisle — Code Extraction & Precise Modification Patterns
- **Surgical Diffing Over Wholesale Overwrites**: Use fine-grained, contiguous text replacements (`replace_file_content` / `multi_replace_file_content`). Never overwrite multi-thousand-line files when targeting localized edits.
- **Clean Component & Logic Extraction**: When separating concerns, extract helper functions or UI modules cleanly with single responsibility.
- **Context Preservation**: Preserve all valid developer comments, docstrings, and license annotations. Ensure whitespace, line endings, and enclosing brackets remain completely balanced.

### 4. UI Skills — UI/UX Standards & Component Patterns
- **Visual Aesthetic Excellence**:
  - Follow the established design system: Dark Luxury Base (`--bg-base: #040914`), Mint Neon Glow (`--accent: #00f5c4`), Cyan (`--accent-cyan: #38bdf8`), and Indigo (`--accent-purple: #818cf8`).
  - Use glassmorphism (`backdrop-filter: blur()`, subtle semi-transparent borders `rgba(148, 194, 255, 0.1)`).
  - Micro-interactions: Hardware-accelerated hover effects (`transform`, `opacity`), smooth transitions (300ms cubic-bezier).
- **Responsive & Accessible**:
  - Mobile-first responsiveness across standard viewports (360px, 768px, 1024px, 1440px+).
  - WCAG AA contrast compliance for all text against dark surfaces.
  - Semantic HTML5 tags (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`).
- **Zero-Placeholder Guarantee**: Never use placeholder images, `lorem ipsum` mock copy, or broken demo links. Generate realistic, production-ready assets and text.

### 5. Anti-Slop — Zero-Bloat & Anti-Filler Enforcement
- **Strictly Banned**:
  - Trivial, restating comments (e.g., `// set variable x to 5`).
  - Generic corporate buzzword mockups or speculative helper utilities.
  - Hallucinated imports or redundant wrapper functions that merely pass through arguments.
  - Empty TODO blocks or unresolved stubs in final production code.
- **Direct & Purposeful**: Every line of code, CSS selector, and DOM node must have an active, tangible function in the application.

### 6. GSD (Get Shit Done) — Structured Sequential Execution Loop
To prevent context saturation, drift, and hallucination on complex tasks:
1. **Deconstruct**: Break complex tasks into distinct, atomic sub-tasks with unambiguous criteria.
2. **Execute Sequentially**: Complete step *N* completely and verify before proceeding to step *N+1*.
3. **Trace Milestones**: Keep an explicit checklist. Communicate clear status updates at each transition.
4. **Anti-Hallucination Barrier**: Constantly ground changes in actual file content, not recalled or assumed structure.

### 7. Ralph Loop — Iterative Self-Correction & Verification
1. **Generate**: Produce the precise modification.
2. **Verify**: Inspect modified files, validate syntax, execute linting or browser testing where applicable.
3. **Inspect Feedback**: Detect console errors, broken styles, layout shifts, or missed edge cases immediately.
4. **Self-Correct**: If an error or regression appears, initiate a targeted correction cycle with fresh, accurate context.
5. **Converge**: Exit the loop only when 100% of acceptance criteria are confirmed satisfied.

### 8. Ponytail — Anti-Overengineering Toolkit
- **KISS & YAGNI**: Reject premature abstraction, unnecessary design patterns, and speculative feature architectures.
- **Native Platform First**: Prefer vanilla ES6+ standards, CSS Custom Properties, and native DOM APIs over heavy third-party packages or complex runtimes unless explicitly requested.
- **Token & Performance Optimization**: Keep code concise, high-density, and performant. Eliminate redundant nesting, duplicate CSS selectors, and bloated polyfills.

### 9. CodeRabbit — Automated Code Review Persona
Before concluding any implementation or delivering changes, run a mandatory CodeRabbit review pass:
- **Security Check**:
  - Ensure zero XSS risks (safe `textContent` vs `innerHTML`, safe clipboard APIs, sanitized URL inputs).
  - Verify no API keys, credentials, or secrets are exposed in client-side scripts.
- **Performance & Robustness**:
  - Debounce/throttle high-frequency event listeners (scroll, resize, input).
  - Check for memory leaks (unbound event listeners, runaway intervals).
- **Edge Cases & Graceful Degradation**:
  - Fallback mechanisms for modern APIs (e.g., Clipboard API fallback, modal ESC key handling, touch device responsiveness).
- **CodeRabbit Final Sign-off**: Explicitly highlight any findings, security verification status, and architectural improvements made.

---

## ⚡ Unified Execution Workflow Lifecycle

Every task processed in this repository must follow this unified pipeline:

```
[User Request]
       │
       ▼
1. GSD Sub-task Breakdown
       │
       ▼
2. SkillSpector (Reconnaissance & Scan)
       │
       ▼
3. Ponytail (Simplicity Check: Native first, no overengineering)
       │
       ▼
4. Reticle & Chisle (Precision Targeted Editing)
       │
       ▼
5. Ralph Loop (Iterative Verification & Self-Correction)
       │
       ▼
6. Anti-Slop (Pruning boilerplate, stubs, and verbose fluff)
       │
       ▼
7. CodeRabbit (Final Review: Security, Performance, Bugs, Accessibility)
       │
       ▼
[Production Delivery]
```
