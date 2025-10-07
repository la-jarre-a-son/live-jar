import { defaults } from '../main/store/defaults';

require('jest-fetch-mock').enableMocks();

window.os = {
  isMac: true,
  isWindows: false,
  platform: process.platform,
};

window.app = {
  quit: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  settings: {
    clear: jest.fn(),
    reset: jest.fn(),
    getSettings: jest.fn().mockReturnValue(Promise.resolve(defaults.settings)),
    updateSetting: jest.fn(),
    updateSettings: jest.fn(),
    onSettingsChange: jest.fn().mockReturnValue(jest.fn()),
    dismissChangelog: jest.fn(),
    dismissUpdate: jest.fn(),
    onUpdateInfo: jest.fn().mockReturnValue(jest.fn()),
    checkUpdates: jest.fn(),
  },
  stream: {
    list: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    switch: jest.fn(),
  },
  playlists: {
    list: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  },
  window: {
    get: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
    minimize: jest.fn(),
    maximize: jest.fn(),
    unmaximize: jest.fn(),
    titleBarDoubleClick: jest.fn(),
    solo: jest.fn(),
    getState: jest.fn(),
    setState: jest.fn(),
    onStateChange: jest.fn().mockReturnValue(jest.fn()),
  },
};
