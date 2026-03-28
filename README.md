# NiceTab Sync Fork

Personal fork of [web-dahuyou/NiceTab](https://github.com/web-dahuyou/NiceTab)
focused on improving native browser tab-group synchronization after restore.

## What This Fork Adds

- Live sync for native browser tab groups restored from the NiceTab admin page.
- Stored groups are overwritten from the live browser group state, so
  `ABCD -> CDEF` stays `CDEF` instead of merging into `ABCDEF`.
- Sync only applies to groups restored from NiceTab. Manually created browser
  groups are not tracked.
- If the linked native group is closed or removed, the stored NiceTab group is
  kept and the live binding is cleared.
- If `deleteAfterRestore` is enabled, the original delete flow is preserved and
  no live binding is created.

## Current Status

- The live-sync feature was implemented, built, and tested on this fork.
- The fork keeps upstream structure and behavior wherever this sync enhancement
  does not need to intervene.

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

This repository is a personal fork, not the upstream project. For the original
project history, release channels, and broader feature set, see
[web-dahuyou/NiceTab](https://github.com/web-dahuyou/NiceTab).
