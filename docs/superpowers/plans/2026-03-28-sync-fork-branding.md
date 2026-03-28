# NiceTab Sync Fork Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the fork-facing repository presentation as `NiceTab Sync Fork` while preserving the original upstream README and keeping runtime behavior unchanged.

**Architecture:** Keep the change set narrow. Preserve the current upstream English README as an archived reference file, replace the GitHub homepage README with a fork-specific landing page, and update only outward-facing metadata in `wxt.config.ts` and `package.json`. Verification should confirm source edits compile and build cleanly, then restore generated `public/docs/*` artifacts so only intentional source changes remain in version control.

**Tech Stack:** Markdown, TypeScript config, WXT, pnpm 7.33.7

---

## File Map

- Create: `README-upstream.md`
  Preserve the current upstream English README verbatim.

- Modify: `README.md`
  Replace the repository homepage content with a fork-specific landing page for `NiceTab Sync Fork`.

- Modify: `wxt.config.ts`
  Update extension display name and homepage URL.

- Modify: `package.json`
  Update the package description to reflect the fork branding and live-sync feature.

- Verify only: `public/docs/*`
  Build will regenerate tracked HTML docs; restore this generated folder before the final status check so it does not leak into the branding commit.

### Task 1: Preserve the Upstream README and Add the Fork Landing Page

**Files:**
- Create: `README-upstream.md`
- Modify: `README.md`

- [ ] **Step 1: Preserve the current upstream README under a new filename**

Run:

```bash
git mv README.md README-upstream.md
```

Expected: `git status --short` shows a rename from `README.md` to `README-upstream.md`.

- [ ] **Step 2: Write the new fork-facing homepage README**

Replace `README.md` with:

```markdown
# NiceTab Sync Fork

Personal fork of [web-dahuyou/NiceTab](https://github.com/web-dahuyou/NiceTab) focused on improving native browser tab-group synchronization after restore.

## What This Fork Adds

- Live sync for native browser tab groups restored from the NiceTab admin page.
- Stored groups are overwritten from the live browser group state, so `ABCD -> CDEF` stays `CDEF` instead of merging into `ABCDEF`.
- Sync only applies to groups restored from NiceTab. Manually created browser groups are not tracked.
- If the linked native group is closed or removed, the stored NiceTab group is kept and the live binding is cleared.
- If `deleteAfterRestore` is enabled, the original delete flow is preserved and no live binding is created.

## Current Status

- Feature branch work was merged into this fork and verified with unit tests, type-checking, linting, build output, and manual browser testing.
- The fork currently keeps upstream structure and behavior wherever this sync enhancement does not need to intervene.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the main checks:

```bash
corepack pnpm@7.33.7 test:unit
corepack pnpm@7.33.7 compile
corepack pnpm@7.33.7 lint:no-fix
corepack pnpm@7.33.7 build
```

Load the unpacked extension from:

```text
.output/chrome-mv3
```

## Documentation

- [Fork Notes (this file)](./README.md)
- [Original Upstream README](./README-upstream.md)
- [Original Chinese README](./README-zh.md)
- [User Guide](./GUIDE-zh.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Upstream Relationship

This repository is a personal fork, not the upstream project. For the original project history, release channels, and broader feature set, see [web-dahuyou/NiceTab](https://github.com/web-dahuyou/NiceTab).
```

- [ ] **Step 3: Sanity-check the new README structure**

Run:

```bash
rg -n "^#|^\-\s|^\[.*\]\(" README.md README-upstream.md
```

Expected: `README.md` shows the new `NiceTab Sync Fork` title and section headings, and `README-upstream.md` still begins with `# NiceTab`.

- [ ] **Step 4: Commit the README reshaping**

Run:

```bash
git add README.md README-upstream.md
git commit -m "docs: add sync fork landing page"
```

### Task 2: Update Extension and Package Display Metadata

**Files:**
- Modify: `wxt.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Update the extension display name and homepage URL**

In `wxt.config.ts`, change the manifest fields to:

```ts
  manifest: {
    name: 'NiceTab Sync Fork',
    permissions: [
      'storage',
      'tabs',
      'contextMenus',
      'unlimitedStorage',
      'alarms',
      'scripting',
      ...(isFirefox ? [] : ['tabGroups', 'commands', 'favicon']),
    ],
    optional_permissions: ['tabGroups'],
    homepage_url: 'https://github.com/MoTao233/NiceTab',
```

- [ ] **Step 2: Update the package description without changing the package name**

In `package.json`, keep `"name": "nice-tab"` unchanged and replace the description line with:

```json
  "description": "NiceTab Sync Fork - a personal NiceTab fork with live sync for native browser tab groups restored from the NiceTab admin page",
```

- [ ] **Step 3: Verify the metadata edits are isolated**

Run:

```bash
git diff -- wxt.config.ts package.json
```

Expected: the diff only shows the `manifest.name`, `homepage_url`, and `description` changes described above.

- [ ] **Step 4: Commit the metadata updates**

Run:

```bash
git add wxt.config.ts package.json
git commit -m "docs: rename sync fork metadata"
```

### Task 3: Verify the Branding Change and Restore Generated Docs

**Files:**
- Modify during verification only: `public/docs/*`

- [ ] **Step 1: Run type-checking**

Run:

```bash
corepack pnpm@7.33.7 compile
```

Expected: command exits with code `0`.

- [ ] **Step 2: Run a production build**

Run:

```bash
corepack pnpm@7.33.7 build
```

Expected: command exits with code `0` and produces `.output/chrome-mv3`.

- [ ] **Step 3: Inspect generated-file churn after the build**

Run:

```bash
git status --short
```

Expected: source changes are already committed, and any new worktree dirt should be limited to generated `public/docs/*` files from the markdown-to-HTML step.

- [ ] **Step 4: Restore generated docs so only intentional source changes remain**

Run:

```bash
git restore -- public/docs
```

Expected: generated HTML/CSS files under `public/docs` return to the checked-in state.

- [ ] **Step 5: Confirm the worktree is clean**

Run:

```bash
git status --short
```

Expected: no output.

## Self-Review

- **Spec coverage:** The plan covers the three approved areas from the spec: a new fork homepage README, preservation of the original upstream README, and outward-facing metadata updates in `wxt.config.ts` and `package.json`.
- **Placeholder scan:** No `TODO`, `TBD`, or implicit “handle later” steps remain. Every edit step includes exact file paths, exact content, and concrete commands.
- **Type consistency:** The plan keeps the approved names consistent across all tasks: `NiceTab Sync Fork`, `README-upstream.md`, `https://github.com/MoTao233/NiceTab`, and unchanged package name `nice-tab`.
