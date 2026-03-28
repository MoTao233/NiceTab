import assert from 'node:assert/strict';
import test from 'node:test';

import { restoreStoredTabGroup } from '../entrypoints/common/restoreStoredTabGroup';

test('binds the created browser group when a stored group is restored as a native group', async () => {
  const bindCalls: Array<{
    groupId: string;
    linkedBrowserGroupId: number;
    linkedBrowserWindowId: number;
  }> = [];

  const result = await restoreStoredTabGroup(
    {
      storedGroupId: 'stored-group',
      groupName: 'Saved Group',
      urls: ['https://c.test', 'https://d.test'],
      discard: false,
      asGroup: true,
    },
    {
      openGroup: async () => ({ bsGroupId: 77, windowId: 7 }),
      bindGroup: async payload => {
        bindCalls.push(payload);
      },
    },
  );

  assert.deepEqual(result, { bsGroupId: 77, windowId: 7 });
  assert.deepEqual(bindCalls, [
    {
      groupId: 'stored-group',
      linkedBrowserGroupId: 77,
      linkedBrowserWindowId: 7,
    },
  ]);
});

test('does not bind when restore opens plain tabs instead of a native browser group', async () => {
  const bindCalls: Array<unknown> = [];

  const result = await restoreStoredTabGroup(
    {
      storedGroupId: 'stored-group',
      groupName: 'Saved Group',
      urls: ['https://c.test', 'https://d.test'],
      discard: false,
      asGroup: false,
    },
    {
      openGroup: async () => ({ windowId: 7 }),
      bindGroup: async payload => {
        bindCalls.push(payload);
      },
    },
  );

  assert.deepEqual(result, { windowId: 7 });
  assert.equal(bindCalls.length, 0);
});
