export type RestoreStoredTabGroupArgs = {
  storedGroupId: string;
  groupName: string;
  urls: Array<string | undefined>;
  discard?: boolean;
  asGroup: boolean;
};

type OpenGroupFn = typeof import('./tabs').openNewGroup;
type BindGroupFn = typeof import('./storage').tabListUtils.bindBrowserGroupToStoredGroup;

export type RestoreStoredTabGroupResult = Awaited<ReturnType<OpenGroupFn>>;

export type RestoreStoredTabGroupDeps = {
  openGroup?: OpenGroupFn;
  bindGroup?: BindGroupFn;
};

export async function restoreStoredTabGroup(
  args: RestoreStoredTabGroupArgs,
  deps: RestoreStoredTabGroupDeps = {},
) {
  let openGroup = deps.openGroup;
  if (!openGroup) {
    ({ openNewGroup: openGroup } = await import('./tabs'));
  }

  let bindGroup = deps.bindGroup;
  if (!bindGroup) {
    const { tabListUtils } = await import('./storage');
    bindGroup = tabListUtils.bindBrowserGroupToStoredGroup.bind(tabListUtils);
  }

  const result = await openGroup(args.groupName, args.urls, {
    discard: args.discard,
    asGroup: args.asGroup,
  });

  if (args.asGroup && result.bsGroupId != undefined && result.windowId != undefined) {
    await bindGroup({
      groupId: args.storedGroupId,
      linkedBrowserGroupId: result.bsGroupId,
      linkedBrowserWindowId: result.windowId,
    });
  }

  return result;
}

export default { restoreStoredTabGroup };
