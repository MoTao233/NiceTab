# NiceTab Sync Fork Branding Design

## Summary

Refresh the fork-facing repository presentation so the GitHub homepage and extension metadata clearly describe this fork as `NiceTab Sync Fork`, while preserving the original upstream README for reference.

## Goals

- Make the repository homepage reflect the fork identity instead of the upstream project README.
- Keep the original upstream English README available in the repository.
- Update visible extension metadata so built artifacts show `NiceTab Sync Fork`.
- Keep package-management identifiers stable to avoid unnecessary tooling churn.

## Non-Goals

- Do not rewrite the existing upstream Chinese README in this iteration.
- Do not remove the original upstream documentation.
- Do not change runtime behavior or add new extension features as part of this documentation refresh.
- Do not rename the npm package from `nice-tab`.

## Approved Approach

### 1. Replace the GitHub homepage README

Rewrite `README.md` into a fork-specific landing page titled `NiceTab Sync Fork`.

The new homepage README should:

- identify the project as a personal fork of upstream `NiceTab`
- call out the current fork-only feature: live sync for native browser tab groups restored from NiceTab
- explain the behavior boundary:
  - applies only to groups restored from NiceTab
  - overwrites stored state from the live browser group
  - does not affect manually created browser groups
  - keeps stored data if the linked native group disappears
  - keeps `deleteAfterRestore` behavior unchanged
- provide short local build and load instructions
- link to upstream/reference docs kept in the repository

### 2. Preserve the original upstream README

Keep the current upstream English README by moving it to `README-upstream.md`.

The new `README.md` should link to:

- `README-upstream.md`
- `README-zh.md`
- `GUIDE.md` or `GUIDE-zh.md` as appropriate
- `CONTRIBUTING.md`

### 3. Update display metadata

Adjust only outward-facing metadata:

- change `manifest.name` in `wxt.config.ts` to `NiceTab Sync Fork`
- change `homepage_url` in `wxt.config.ts` to `https://github.com/MoTao233/NiceTab`
- update `description` in `package.json` to a fork-specific summary mentioning the live-sync enhancement

Leave `package.json` field `name: "nice-tab"` unchanged.

## Testing

After the documentation and metadata edits:

- run `corepack pnpm@7.33.7 compile`
- run `corepack pnpm@7.33.7 build`

Build verification is sufficient because the changes are documentation and metadata only.

## Risks

- Rebuilding will regenerate `public/docs/*`; those generated files should only be committed if intentionally updated.
- Changing `manifest.name` will change how the extension appears in the browser extension list, which is expected.
