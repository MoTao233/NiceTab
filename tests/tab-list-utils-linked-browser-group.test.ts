import assert from 'node:assert/strict';
import test from 'node:test';

import TabListUtils from '../entrypoints/common/storage/tabListUtils';
import type { TagItem } from '../entrypoints/types';

type StorageMock = {
  getItem: (key: string) => Promise<TagItem[] | undefined>;
  setItem: (key: string, value: TagItem[]) => Promise<void>;
};

function createTagList(): TagItem[] {
  return [
    {
      static: true,
      tagId: '0',
      tagName: 'Staging Area',
      createTime: '2026-03-28 10:00:00',
      groupList: [
        {
          groupId: 'stored-group',
          groupName: 'Saved Group',
          createTime: '2026-03-28 10:00:00',
          tabList: [
            { tabId: 'a', title: 'A', url: 'https://a.test' },
            { tabId: 'b', title: 'B', url: 'https://b.test' },
            { tabId: 'c', title: 'C', url: 'https://c.test' },
            { tabId: 'd', title: 'D', url: 'https://d.test' },
          ],
        },
      ],
    },
  ];
}

function installStorage(tagList: TagItem[]): StorageMock {
  let current = structuredClone(tagList);
  const storageMock: StorageMock = {
    async getItem(key: string) {
      if (key !== 'local:tabList') return undefined;
      return structuredClone(current);
    },
    async setItem(key: string, value: TagItem[]) {
      if (key === 'local:tabList') {
        current = structuredClone(value);
      }
    },
  };

  Object.assign(globalThis, { storage: storageMock });
  return storageMock;
}

function installBrowser() {
  Object.assign(globalThis, {
    browser: {
      tabs: {
        async query({ windowId }: { windowId?: number } = {}) {
          if (windowId !== 7) return [];
          return [
            {
              id: 31,
              windowId: 7,
              groupId: 77,
              title: 'C',
              url: 'https://c.test',
              favIconUrl: 'https://c.test/icon.ico',
            },
            {
              id: 32,
              windowId: 7,
              groupId: 77,
              title: 'D',
              url: 'https://d.test',
              favIconUrl: 'https://d.test/icon.ico',
            },
            {
              id: 33,
              windowId: 7,
              groupId: 77,
              title: 'E',
              url: 'https://e.test',
              favIconUrl: 'https://e.test/icon.ico',
            },
            {
              id: 34,
              windowId: 7,
              groupId: 77,
              title: 'F',
              url: 'https://f.test',
              favIconUrl: 'https://f.test/icon.ico',
            },
          ];
        },
      },
      tabGroups: {
        async get(groupId: number) {
          if (groupId !== 77) {
            throw new Error(`Missing browser group: ${groupId}`);
          }
          return { id: 77, windowId: 7, title: 'Synced Group' };
        },
      },
    },
  });
}

test('bindBrowserGroupToStoredGroup stores native browser metadata on the saved group', async () => {
  installStorage(createTagList());
  installBrowser();

  const utils = new TabListUtils();
  await utils.bindBrowserGroupToStoredGroup({
    groupId: 'stored-group',
    linkedBrowserGroupId: 77,
    linkedBrowserWindowId: 7,
  });

  const tagList = await utils.getTagList();
  const group = tagList[0].groupList[0];

  assert.equal(group.linkedBrowserGroupId, 77);
  assert.equal(group.linkedBrowserWindowId, 7);
  assert.equal(group.linkedBrowserSync, true);
});

test(
  'bindBrowserGroupToStoredGroup clears the previous stored binding for the same browser group',
  async () => {
    installStorage([
      {
        static: true,
        tagId: '0',
        tagName: 'Staging Area',
        createTime: '2026-03-28 10:00:00',
        groupList: [
          {
            groupId: 'old-group',
            groupName: 'Old Group',
            createTime: '2026-03-28 10:00:00',
            tabList: [{ tabId: 'a', title: 'A', url: 'https://a.test' }],
            linkedBrowserGroupId: 77,
            linkedBrowserWindowId: 7,
            linkedBrowserSync: true,
          },
          {
            groupId: 'stored-group',
            groupName: 'Saved Group',
            createTime: '2026-03-28 10:00:00',
            tabList: [{ tabId: 'b', title: 'B', url: 'https://b.test' }],
          },
        ],
      },
    ]);
    installBrowser();

    const utils = new TabListUtils();
    await utils.bindBrowserGroupToStoredGroup({
      groupId: 'stored-group',
      linkedBrowserGroupId: 77,
      linkedBrowserWindowId: 7,
    });

    const tagList = await utils.getTagList();
    const oldGroup = tagList[0].groupList[0];
    const newGroup = tagList[0].groupList[1];

    assert.equal(oldGroup.linkedBrowserGroupId, undefined);
    assert.equal(oldGroup.linkedBrowserWindowId, undefined);
    assert.equal(oldGroup.linkedBrowserSync, undefined);
    assert.equal(newGroup.linkedBrowserGroupId, 77);
    assert.equal(newGroup.linkedBrowserWindowId, 7);
    assert.equal(newGroup.linkedBrowserSync, true);
  },
);

test('syncStoredGroupFromBrowserGroup replaces tabs instead of merging them', async () => {
  installStorage(createTagList());
  installBrowser();

  const utils = new TabListUtils();
  await utils.bindBrowserGroupToStoredGroup({
    groupId: 'stored-group',
    linkedBrowserGroupId: 77,
    linkedBrowserWindowId: 7,
  });

  await utils.syncStoredGroupFromBrowserGroup(77);

  const tagList = await utils.getTagList();
  const group = tagList[0].groupList[0];

  assert.equal(group.groupName, 'Synced Group');
  assert.deepEqual(
    group.tabList.map(tab => tab.url),
    ['https://c.test', 'https://d.test', 'https://e.test', 'https://f.test'],
  );
});

test(
  'syncStoredGroupFromBrowserGroup clears binding but keeps saved data when the browser group disappears',
  async () => {
    installStorage(createTagList());
    Object.assign(globalThis, {
      browser: {
        tabs: {
          async query() {
            return [];
          },
        },
        tabGroups: {
          async get() {
            throw new Error('Browser group was removed');
          },
        },
      },
    });

    const utils = new TabListUtils();
    await utils.bindBrowserGroupToStoredGroup({
      groupId: 'stored-group',
      linkedBrowserGroupId: 77,
      linkedBrowserWindowId: 7,
    });

    await utils.syncStoredGroupFromBrowserGroup(77);

    const tagList = await utils.getTagList();
    const group = tagList[0].groupList[0];

    assert.equal(group.linkedBrowserGroupId, undefined);
    assert.equal(group.linkedBrowserWindowId, undefined);
    assert.equal(group.linkedBrowserSync, undefined);
    assert.deepEqual(
      group.tabList.map(tab => tab.url),
      ['https://a.test', 'https://b.test', 'https://c.test', 'https://d.test'],
    );
  },
);
