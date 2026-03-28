import type SettingsUtils from './settingsUtils';
import type ThemeUtils from './themeUtils';
import type TabListUtils from './tabListUtils';
import type RecycleBinUtils from './recycleBinUtils';
import type SyncUtils from './syncUtils';
import type SyncWebDAVUtils from './syncWebDAVUtils';
import type StateUtils from './stateUtils';

let _settingsUtils: SettingsUtils;
let _themeUtils: ThemeUtils;
let _tabListUtils: TabListUtils;
let _recycleBinUtils: RecycleBinUtils;
let _syncUtils: SyncUtils;
let _syncWebDAVUtils: SyncWebDAVUtils;
let _stateUtils: StateUtils;

export default class Store {
  static get settingsUtils() {
    return _settingsUtils;
  }
  static get themeUtils() {
    return _themeUtils;
  }
  static get tabListUtils() {
    return _tabListUtils;
  }
  static get recycleBinUtils() {
    return _recycleBinUtils;
  }
  static get syncUtils() {
    return _syncUtils;
  }
  static get syncWebDAVUtils() {
    return _syncWebDAVUtils;
  }
  static get stateUtils() {
    return _stateUtils;
  }

  static set settingsUtils(utils: SettingsUtils) {
    _settingsUtils = utils;
  }
  static set themeUtils(utils: ThemeUtils) {
    _themeUtils = utils;
  }
  static set tabListUtils(utils: TabListUtils) {
    _tabListUtils = utils;
  }
  static set recycleBinUtils(utils: RecycleBinUtils) {
    _recycleBinUtils = utils;
  }
  static set syncUtils(utils: SyncUtils) {
    _syncUtils = utils;
  }
  static set syncWebDAVUtils(utils: SyncWebDAVUtils) {
    _syncWebDAVUtils = utils;
  }
  static set stateUtils(utils: StateUtils) {
    _stateUtils = utils;
  }
}
