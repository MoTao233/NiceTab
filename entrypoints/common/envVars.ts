export type BrowserType = 'chrome' | 'edge' | 'firefox';

const env = ((import.meta as ImportMeta & { env?: Record<string, unknown> }).env ||
  {}) as Record<string, unknown>;
const browserType = (env.BROWSER as BrowserType) || 'chrome';

export const shortcutsPageUrlMap: Record<BrowserType, string> = {
  chrome: 'chrome://extensions/shortcuts',
  edge: 'edge://extensions/shortcuts',
  firefox: 'about:addons',
};
// 修改快捷键的页面地址
export const SHORTCUTS_PAGE_URL = shortcutsPageUrlMap[browserType];

export const browserActionApiNames: Record<BrowserType, 'action' | 'browserAction'> = {
  chrome: 'action',
  edge: 'action',
  firefox: 'browserAction',
};
// chrome 中调用browser.action.setPopup 等api, firefox-v2 中调用browser.browserAction.setPopup 等api
export const BROWSER_ACTION_API_NAME = browserActionApiNames[browserType];

export default {
  SHORTCUTS_PAGE_URL,
};
