import assert from 'node:assert/strict';
import test from 'node:test';

import { createNativeGroupSyncController } from '../entrypoints/background/nativeGroupSync';

function createEventSlot<T extends (...args: any[]) => unknown>() {
  let listener: T | undefined;
  return {
    addListener(fn: T) {
      listener = fn;
    },
    removeListener(fn: T) {
      if (listener === fn) {
        listener = undefined;
      }
    },
    async emit(...args: Parameters<T>) {
      if (!listener) return;
      await listener(...args);
    },
  };
}

test('syncs the exact linked browser group when a grouped tab changes', async () => {
  const tabsOnCreated = createEventSlot<(tab: { groupId?: number; windowId?: number }) => Promise<void>>();
  const tabsOnUpdated = createEventSlot<
    (tabId: number, changeInfo: unknown, tab: { groupId?: number; windowId?: number }) => Promise<void>
  >();
  const tabsOnRemoved = createEventSlot<
    (tabId: number, removeInfo: { windowId: number }) => Promise<void>
  >();
  const tabsOnMoved = createEventSlot<
    (tabId: number, moveInfo: { windowId: number }) => Promise<void>
  >();
  const tabsOnAttached = createEventSlot<
    (tabId: number, attachInfo: { newWindowId: number }) => Promise<void>
  >();
  const tabsOnDetached = createEventSlot<
    (tabId: number, detachInfo: { oldWindowId: number }) => Promise<void>
  >();
  const tabGroupsOnUpdated = createEventSlot<(group: { id: number; windowId?: number }) => Promise<void>>();
  const tabGroupsOnRemoved = createEventSlot<(group: { id: number; windowId?: number }) => Promise<void>>();

  const calls: Array<[string, number]> = [];
  const controller = createNativeGroupSyncController({
    browserApi: {
      tabs: {
        onCreated: tabsOnCreated,
        onUpdated: tabsOnUpdated,
        onRemoved: tabsOnRemoved,
        onMoved: tabsOnMoved,
        onAttached: tabsOnAttached,
        onDetached: tabsOnDetached,
      },
      tabGroups: {
        onUpdated: tabGroupsOnUpdated,
        onRemoved: tabGroupsOnRemoved,
      },
    } as never,
    tabListApi: {
      async syncStoredGroupFromBrowserGroup(groupId: number) {
        calls.push(['group', groupId]);
      },
      async syncLinkedBrowserGroupsByWindowId(windowId: number) {
        calls.push(['window', windowId]);
      },
    } as never,
    debounceFn: fn => fn,
  });

  controller.register();
  await tabsOnUpdated.emit(31, { status: 'complete' }, { groupId: 77, windowId: 7 });

  assert.deepEqual(calls, [['group', 77]]);
});

test('falls back to a window sweep when a tab is removed', async () => {
  const tabsOnCreated = createEventSlot<(tab: { groupId?: number; windowId?: number }) => Promise<void>>();
  const tabsOnUpdated = createEventSlot<
    (tabId: number, changeInfo: unknown, tab: { groupId?: number; windowId?: number }) => Promise<void>
  >();
  const tabsOnRemoved = createEventSlot<
    (tabId: number, removeInfo: { windowId: number }) => Promise<void>
  >();
  const tabsOnMoved = createEventSlot<
    (tabId: number, moveInfo: { windowId: number }) => Promise<void>
  >();
  const tabsOnAttached = createEventSlot<
    (tabId: number, attachInfo: { newWindowId: number }) => Promise<void>
  >();
  const tabsOnDetached = createEventSlot<
    (tabId: number, detachInfo: { oldWindowId: number }) => Promise<void>
  >();
  const tabGroupsOnUpdated = createEventSlot<(group: { id: number; windowId?: number }) => Promise<void>>();
  const tabGroupsOnRemoved = createEventSlot<(group: { id: number; windowId?: number }) => Promise<void>>();

  const calls: Array<[string, number]> = [];
  const controller = createNativeGroupSyncController({
    browserApi: {
      tabs: {
        onCreated: tabsOnCreated,
        onUpdated: tabsOnUpdated,
        onRemoved: tabsOnRemoved,
        onMoved: tabsOnMoved,
        onAttached: tabsOnAttached,
        onDetached: tabsOnDetached,
      },
      tabGroups: {
        onUpdated: tabGroupsOnUpdated,
        onRemoved: tabGroupsOnRemoved,
      },
    } as never,
    tabListApi: {
      async syncStoredGroupFromBrowserGroup(groupId: number) {
        calls.push(['group', groupId]);
      },
      async syncLinkedBrowserGroupsByWindowId(windowId: number) {
        calls.push(['window', windowId]);
      },
    } as never,
    debounceFn: fn => fn,
  });

  controller.register();
  await tabsOnRemoved.emit(31, { windowId: 7 });

  assert.deepEqual(calls, [['window', 7]]);
});

test('syncs the removed browser group and then sweeps its window', async () => {
  const tabsOnCreated = createEventSlot<(tab: { groupId?: number; windowId?: number }) => Promise<void>>();
  const tabsOnUpdated = createEventSlot<
    (tabId: number, changeInfo: unknown, tab: { groupId?: number; windowId?: number }) => Promise<void>
  >();
  const tabsOnRemoved = createEventSlot<
    (tabId: number, removeInfo: { windowId: number }) => Promise<void>
  >();
  const tabsOnMoved = createEventSlot<
    (tabId: number, moveInfo: { windowId: number }) => Promise<void>
  >();
  const tabsOnAttached = createEventSlot<
    (tabId: number, attachInfo: { newWindowId: number }) => Promise<void>
  >();
  const tabsOnDetached = createEventSlot<
    (tabId: number, detachInfo: { oldWindowId: number }) => Promise<void>
  >();
  const tabGroupsOnUpdated = createEventSlot<(group: { id: number; windowId?: number }) => Promise<void>>();
  const tabGroupsOnRemoved = createEventSlot<(group: { id: number; windowId?: number }) => Promise<void>>();

  const calls: Array<[string, number]> = [];
  const controller = createNativeGroupSyncController({
    browserApi: {
      tabs: {
        onCreated: tabsOnCreated,
        onUpdated: tabsOnUpdated,
        onRemoved: tabsOnRemoved,
        onMoved: tabsOnMoved,
        onAttached: tabsOnAttached,
        onDetached: tabsOnDetached,
      },
      tabGroups: {
        onUpdated: tabGroupsOnUpdated,
        onRemoved: tabGroupsOnRemoved,
      },
    } as never,
    tabListApi: {
      async syncStoredGroupFromBrowserGroup(groupId: number) {
        calls.push(['group', groupId]);
      },
      async syncLinkedBrowserGroupsByWindowId(windowId: number) {
        calls.push(['window', windowId]);
      },
    } as never,
    debounceFn: fn => fn,
  });

  controller.register();
  await tabGroupsOnRemoved.emit({ id: 77, windowId: 7 });

  assert.deepEqual(calls, [
    ['group', 77],
    ['window', 7],
  ]);
});
