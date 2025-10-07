import { StoreType } from '../types/Store';

export const defaults: StoreType = {
  settings: {
    auth: {
      twitch: null,
    },
    general: {
      reopenWindows: true,
      topbarStyle: 'hidden',
      volumeScrollSpeed: 0.1,
      latencyHighThreshold: 7.0,
      mutePrerollTimeout: 15.0,
      autoRefreshHighLatency: false,
      doubleClickAction: 'solo',
    },
    windows: [],
    playlists: [{ label: 'recent', type: 'twitch', entries: [] }],
    windowState: {
      x: undefined,
      y: undefined,
      width: 800,
      height: 600,
      maximized: false,
      alwaysOnTop: false,
    },
    appState: {
      changelogDismissed: '100.0.0', // hack: ensure changelog does not blink at startup
      updateDismissed: null,
    },
  },
};
