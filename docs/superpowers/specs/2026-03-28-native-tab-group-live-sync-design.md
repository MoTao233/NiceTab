# Native Tab Group Live Sync Design

## Summary

Add live synchronization between a NiceTab group and the browser native tab group that was restored from it. The sync only applies to groups opened from the NiceTab admin page. When the user changes that native group in the browser, NiceTab should overwrite the stored group with the current real state instead of merging new tabs into the old snapshot.

Target outcome:

- Stored group starts as `ABCD`
- User restores it as a native browser group
- User changes the native group to `CDEF`
- NiceTab updates the stored group to `CDEF`

## Problem

Today, NiceTab does not keep a persistent link between a stored `GroupItem` and the browser native tab group created during restore. The send flow uses append/merge behavior:

- `sendCurrentGroup()` in `entrypoints/common/tabs.ts` calls `tabListUtils.createTabs(...)`
- `createTabsByGroups()` in `entrypoints/common/storage/tabListUtils.ts` merges by group name and tab URL

This causes `ABCD -> ABCDEF` instead of `ABCD -> CDEF`.

## Goals

- Sync only the native browser tab group restored from a NiceTab group.
- Overwrite the stored `groupName` and `tabList` with the current browser group state.
- Keep existing unbound groups unchanged.
- Clear the live binding when the native group no longer exists.

## Non-Goals

- Do not sync browser groups that were created manually outside NiceTab.
- Do not support multiple active browser bindings for the same NiceTab group.
- Do not add a new settings toggle in this iteration.
- Do not change the behavior of `sendCurrentGroup()` in this iteration.

## Design

### 1. Persist a live binding on `GroupItem`

Extend `GroupItem` in `entrypoints/types/tabList.ts` with optional fields:

- `linkedBrowserGroupId?: number`
- `linkedBrowserWindowId?: number`
- `linkedBrowserSync?: boolean`

These fields are only populated after restoring a NiceTab group as a browser native tab group. Existing stored data remains valid because the new fields are optional.

### 2. Bind the restored browser group to the stored NiceTab group

Update the restore flow in `entrypoints/options/home/hooks/treeData.ts` and `entrypoints/common/tabs.ts`:

- When a stored group is restored via `openNewGroup(...)`, return the created browser native `bsGroupId` and window id when `asGroup` is true.
- After restore, call a new storage method such as `tabListUtils.bindBrowserGroupToStoredGroup(...)`.
- The binding method will find the stored `GroupItem` by NiceTab `groupId`, clear any previous active binding on that same stored group, and write the new browser binding fields.

If restore opens plain tabs rather than a native group, no binding is created.

### 3. Add background listeners for linked browser groups

Add a dedicated sync module under `entrypoints/common/` or `entrypoints/background/` and initialize it from `entrypoints/background/index.ts`.

The module will register debounced listeners for:

- `browser.tabs.onCreated`
- `browser.tabs.onUpdated`
- `browser.tabs.onRemoved`
- `browser.tabs.onMoved`
- `browser.tabs.onAttached`
- `browser.tabs.onDetached`
- `browser.tabGroups?.onUpdated`
- `browser.tabGroups?.onRemoved`

The listeners should not write storage directly. They should collect affected browser group ids and route them into a debounced sync function.

### 4. Sync by browser group id and overwrite stored data

Add storage helpers in `entrypoints/common/storage/tabListUtils.ts`:

- `findStoredGroupByLinkedBrowserGroupId(bsGroupId: number)`
- `bindBrowserGroupToStoredGroup(...)`
- `clearBrowserGroupBinding(...)`
- `syncStoredGroupFromBrowserGroup(bsGroupId: number)`

`syncStoredGroupFromBrowserGroup(bsGroupId)` should:

1. Find the stored NiceTab group linked to the browser group id.
2. Query the browser window and collect tabs where `tab.groupId === bsGroupId`.
3. Read the current native group title with `browser.tabGroups.get(bsGroupId)`.
4. Transform the current browser tabs into fresh `TabItem[]`.
5. Overwrite the stored group:
   - `groupName = current browser title || existing groupName`
   - `tabList = current browser tabs`
6. Persist the updated tag list.

This method must not merge with the previous stored `tabList`. It is a replace operation.

### 5. Clear bindings when the native group disappears

If `browser.tabGroups.get(bsGroupId)` fails, or the group has no remaining tabs after a sync event:

- Clear `linkedBrowserGroupId`, `linkedBrowserWindowId`, and `linkedBrowserSync`
- Keep the last stored `groupName` and `tabList`
- Do not delete the NiceTab group

This preserves user data while stopping further live sync.

## Edge Cases

- If the user restores the same NiceTab group again, the newest browser group replaces the old binding.
- If a tab is moved out of the linked browser group, the next sync removes it from NiceTab.
- If a new tab is added into the linked browser group, the next sync adds it to NiceTab.
- If the browser group title changes, the next sync updates the NiceTab group name.
- If the group becomes empty because all tabs were removed, NiceTab keeps the stored group and clears the binding.

## Testing Plan

### Automated

Add focused regression coverage around the overwrite behavior in storage helpers:

- binding a browser group to a stored group
- syncing replaces `tabList` instead of merging
- syncing updates `groupName`
- clearing binding when the browser group disappears

If the repository does not have a formal test runner for this area, add the smallest practical test harness or verification script scoped to the new helper methods.

### Manual

1. Create a NiceTab group containing `ABCD`.
2. Restore it as a browser native tab group from the admin page.
3. Remove `A` and `B`, then add `E` and `F`.
4. Confirm the stored NiceTab group becomes `CDEF`.
5. Rename the browser group and confirm the stored group name updates.
6. Close or dissolve the browser group and confirm the stored group remains but stops syncing.
7. Restore the same NiceTab group again and confirm the new browser instance becomes the active binding.

## Implementation Notes

- Reuse existing `transformTabItem(...)` so synced tabs keep the current storage shape.
- Debounce sync writes to avoid heavy storage churn during drag, reorder, and bulk tab operations.
- Keep the sync logic isolated from `sendCurrentGroup()` so the old manual send flow remains unchanged and the new live sync path is easy to reason about.
