import { debounce } from 'lodash-es';

type BrowserApiLike = {
  tabs: {
    onCreated: {
      addListener: (
        fn: (tab: { groupId?: number; windowId?: number }) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (tab: { groupId?: number; windowId?: number }) => void | Promise<void>,
      ) => void;
    };
    onUpdated: {
      addListener: (
        fn: (
          tabId: number,
          changeInfo: unknown,
          tab: { groupId?: number; windowId?: number },
        ) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (
          tabId: number,
          changeInfo: unknown,
          tab: { groupId?: number; windowId?: number },
        ) => void | Promise<void>,
      ) => void;
    };
    onRemoved: {
      addListener: (
        fn: (tabId: number, removeInfo: { windowId: number }) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (tabId: number, removeInfo: { windowId: number }) => void | Promise<void>,
      ) => void;
    };
    onMoved: {
      addListener: (
        fn: (tabId: number, moveInfo: { windowId: number }) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (tabId: number, moveInfo: { windowId: number }) => void | Promise<void>,
      ) => void;
    };
    onAttached: {
      addListener: (
        fn: (tabId: number, attachInfo: { newWindowId: number }) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (tabId: number, attachInfo: { newWindowId: number }) => void | Promise<void>,
      ) => void;
    };
    onDetached: {
      addListener: (
        fn: (tabId: number, detachInfo: { oldWindowId: number }) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (tabId: number, detachInfo: { oldWindowId: number }) => void | Promise<void>,
      ) => void;
    };
  };
  tabGroups?: {
    onUpdated?: {
      addListener: (
        fn: (group: { id: number; windowId?: number }) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (group: { id: number; windowId?: number }) => void | Promise<void>,
      ) => void;
    };
    onRemoved?: {
      addListener: (
        fn: (group: { id: number; windowId?: number }) => void | Promise<void>,
      ) => void;
      removeListener: (
        fn: (group: { id: number; windowId?: number }) => void | Promise<void>,
      ) => void;
    };
  };
};

type TabListApiLike = {
  syncStoredGroupFromBrowserGroup: (groupId: number) => Promise<void>;
  syncLinkedBrowserGroupsByWindowId: (windowId: number) => Promise<void>;
};

type DebounceLike = <T extends (...args: any[]) => unknown>(fn: T, wait: number) => T;

export function createNativeGroupSyncController({
  browserApi = browser as BrowserApiLike,
  tabListApi,
  debounceFn = debounce as DebounceLike,
}: {
  browserApi?: BrowserApiLike;
  tabListApi?: TabListApiLike;
  debounceFn?: DebounceLike;
} = {}) {
  let loadedTabListApi: Promise<TabListApiLike> | undefined;
  const getTabListApi = async () => {
    if (tabListApi) return tabListApi;
    if (!loadedTabListApi) {
      loadedTabListApi = import('~/entrypoints/common/storage').then(
        module => module.tabListUtils as TabListApiLike,
      );
    }
    return loadedTabListApi;
  };

  const syncGroup = debounceFn(async (groupId: number) => {
    if (!groupId || groupId === -1) return;
    const storageApi = await getTabListApi();
    await storageApi.syncStoredGroupFromBrowserGroup(groupId);
  }, 300);

  const syncWindow = debounceFn(async (windowId: number) => {
    const storageApi = await getTabListApi();
    await storageApi.syncLinkedBrowserGroupsByWindowId(windowId);
  }, 300);

  const syncFromTab = async (tab?: { groupId?: number; windowId?: number }) => {
    if (tab?.groupId && tab.groupId !== -1) {
      await syncGroup(tab.groupId);
      return;
    }
    if (tab?.windowId != undefined) {
      await syncWindow(tab.windowId);
    }
  };

  const onTabCreated = async (tab: { groupId?: number; windowId?: number }) => {
    await syncFromTab(tab);
  };

  const onTabUpdated = async (
    _tabId: number,
    _changeInfo: unknown,
    tab: { groupId?: number; windowId?: number },
  ) => {
    await syncFromTab(tab);
  };

  const onTabRemoved = async (_tabId: number, removeInfo: { windowId: number }) => {
    await syncWindow(removeInfo.windowId);
  };

  const onTabMoved = async (_tabId: number, moveInfo: { windowId: number }) => {
    await syncWindow(moveInfo.windowId);
  };

  const onTabAttached = async (_tabId: number, attachInfo: { newWindowId: number }) => {
    await syncWindow(attachInfo.newWindowId);
  };

  const onTabDetached = async (_tabId: number, detachInfo: { oldWindowId: number }) => {
    await syncWindow(detachInfo.oldWindowId);
  };

  const onTabGroupUpdated = async (group: { id: number; windowId?: number }) => {
    await syncGroup(group.id);
  };

  const onTabGroupRemoved = async (group: { id: number; windowId?: number }) => {
    await syncGroup(group.id);
    if (group.windowId != undefined) {
      await syncWindow(group.windowId);
    }
  };

  function register() {
    browserApi.tabs.onCreated.removeListener(onTabCreated);
    browserApi.tabs.onUpdated.removeListener(onTabUpdated);
    browserApi.tabs.onRemoved.removeListener(onTabRemoved);
    browserApi.tabs.onMoved.removeListener(onTabMoved);
    browserApi.tabs.onAttached.removeListener(onTabAttached);
    browserApi.tabs.onDetached.removeListener(onTabDetached);

    browserApi.tabs.onCreated.addListener(onTabCreated);
    browserApi.tabs.onUpdated.addListener(onTabUpdated);
    browserApi.tabs.onRemoved.addListener(onTabRemoved);
    browserApi.tabs.onMoved.addListener(onTabMoved);
    browserApi.tabs.onAttached.addListener(onTabAttached);
    browserApi.tabs.onDetached.addListener(onTabDetached);

    browserApi.tabGroups?.onUpdated?.removeListener(onTabGroupUpdated);
    browserApi.tabGroups?.onRemoved?.removeListener(onTabGroupRemoved);
    browserApi.tabGroups?.onUpdated?.addListener(onTabGroupUpdated);
    browserApi.tabGroups?.onRemoved?.addListener(onTabGroupRemoved);
  }

  return {
    register,
    handlers: {
      onTabCreated,
      onTabUpdated,
      onTabRemoved,
      onTabMoved,
      onTabAttached,
      onTabDetached,
      onTabGroupUpdated,
      onTabGroupRemoved,
    },
  };
}

export default { createNativeGroupSyncController };
