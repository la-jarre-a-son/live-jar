import os from 'os';
import { app, ipcMain, BrowserWindow, systemPreferences } from 'electron';

import {
  ChannelPlaylistType,
  Settings,
  StreamWindow,
  StreamWindowState,
  WindowState,
} from './types';

import {
  getSettings,
  updateSetting,
  updateSettings,
  onSettingsChange,
  resetSettings,
  clearSettings,
  getPlaylists,
  updatePlaylist,
  addToPlaylist,
  deletePlaylist,
  removeFromPlaylist,
} from './settings';

import {
  loginTwitch,
  addStream,
  getWindow,
  updateWindow,
  logoutTwitch,
  getWindows,
  openWindow,
  updateWindowState,
  setMaximized,
  setAlwaysOnTop,
  onMainWindowStateChange,
  getWindowState,
  removeStream,
  getChildWindow,
  switchStreams,
  getOpenWindowIds,
} from './window';
import { checkUpdates, dismissChangelog, dismissUpdate } from './appState';

function sendToAll(channel: string, ...args: unknown[]) {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.webContents.send(channel, ...args);
  });
}

ipcMain.on('app:quit', () => {
  app.quit();
});

/* WINDOW */

ipcMain.handle('app:settings:getSettings', () => {
  const settings = getSettings();
  return settings;
});

ipcMain.handle('app:window:get', (event, id) => {
  const window = getWindow(id);
  return window;
});

ipcMain.on('app:window:open', (event, id) => {
  openWindow(id);
});

ipcMain.on('app:window:close', (event, id) => {
  if (id !== null) {
    const window = getChildWindow(id);
    window?.close();
  } else {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  }
});

ipcMain.on('app:window:minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
});

ipcMain.on('app:window:maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.maximize();
});

ipcMain.on('app:window:unmaximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.unmaximize();
});

ipcMain.on('app:window:titleBarDoubleClick', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && os.platform() === 'darwin') {
    const doubleClickAction = systemPreferences.getUserDefault(
      'AppleActionOnDoubleClick',
      'string',
    );

    if (doubleClickAction === 'Minimize') {
      window.minimize();
    } else if (doubleClickAction === 'Maximize') {
      if (!window.isMaximized()) {
        window.maximize();
      } else {
        window.unmaximize();
      }
    }
  }
});

ipcMain.on('app:window:solo', (event, id: number) => {
  const allWindows = getOpenWindowIds();
  allWindows.forEach((w) => {
    const window = getChildWindow(w);
    const settings = getWindow(w);
    if (window) {
      if (w === id) {
        window.webContents.setAudioMuted(false);
        updateWindowState(w, { muted: false });
      } else if (!settings?.state?.ignoreSolo) {
        window.webContents.setAudioMuted(true);
        updateWindowState(w, { muted: true });
      }
    }
  });
});

ipcMain.on(
  'app:window:setState',
  (event, id: number | null, newState: Partial<StreamWindowState>) => {
    if (id !== null) {
      const window = getChildWindow(id);
      if (window) {
        if (newState.alwaysOnTop !== undefined) {
          window.setAlwaysOnTop(newState.alwaysOnTop, 'floating');
        }
        if (newState.locked !== undefined) {
          window.movable = !newState.locked;
          window.resizable = !newState.locked;
        }
        if (newState.muted !== undefined) {
          window.webContents.setAudioMuted(newState.muted);
        }
      }
      updateWindowState(id, newState);
    } else {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (newState.alwaysOnTop !== undefined) {
        window?.setAlwaysOnTop(newState.alwaysOnTop, 'floating');
      }
    }
  },
);

ipcMain.on('app:window:getState', (event, id: number | null) => {
  event.reply('app:window:state', getWindowState(id));
});

export function bindMainWindowEvents(window: BrowserWindow) {
  window.on('maximize', () => {
    setMaximized(true);
  });
  window.on('unmaximize', () => {
    setMaximized(false);
  });
  window.on('always-on-top-changed', (_event, isAlwaysOnTop) => {
    setAlwaysOnTop(isAlwaysOnTop);
  });

  const unbindStateChange = onMainWindowStateChange((state?: WindowState) => {
    if (state && window) {
      window.webContents.send('app:window:state', state);
    }
  });

  window.on('closed', unbindStateChange);
}

/* General */
ipcMain.handle('app:stream:list', (_event) => {
  return getWindows();
});

ipcMain.handle('app:stream:add', (_event, window: Partial<StreamWindow>) => {
  return addStream(window);
});

ipcMain.handle(
  'app:stream:update',
  (_event, id: number, data: Partial<StreamWindow>) => {
    return updateWindow(id, data);
  },
);

ipcMain.on('app:stream:delete', (_event, id: number) => {
  return removeStream(id);
});

ipcMain.on('app:stream:switch', (_event, id: number, targetId: number) => {
  return switchStreams(id, targetId);
});

ipcMain.on('app:login', (_event) => {
  loginTwitch();
});

ipcMain.on('app:logout', (_event) => {
  logoutTwitch();
});

/* PLAYLISTS */

ipcMain.handle('app:playlist:list', (_event) => {
  return getPlaylists();
});

ipcMain.handle(
  'app:playlist:update',
  (_event, label: string, type: ChannelPlaylistType, entries: string[]) => {
    return updatePlaylist(label, type, entries);
  },
);

ipcMain.handle(
  'app:playlist:add',
  (_event, label: string, type: ChannelPlaylistType, entry: string) => {
    return addToPlaylist(label, type, entry);
  },
);

ipcMain.handle(
  'app:playlist:remove',
  (_event, label: string, type: ChannelPlaylistType, entry: string) => {
    return removeFromPlaylist(label, type, entry);
  },
);

ipcMain.handle(
  'app:playlist:delete',
  (_event, label: string, type: ChannelPlaylistType) => {
    return deletePlaylist(label, type);
  },
);

/* SETTINGS */

ipcMain.handle(
  'app:settings:updateSetting',
  (_event, key: string, value: unknown) => {
    updateSetting(key, value);
  },
);

ipcMain.handle('app:settings:updateSettings', (_event, value: Settings) => {
  updateSettings(value);
});

ipcMain.handle('app:settings:reset', (_event, key) => {
  resetSettings(key);
});

ipcMain.on('app:settings:clear', (_event) => {
  clearSettings();
});

ipcMain.on('app:settings:getChannels', (event) => {
  event.reply('app:settings:channels', ['domingo']);
});

onSettingsChange((settings?: Settings) => {
  if (settings) {
    sendToAll('app:settings', settings);
  }
});

ipcMain.on('app:settings:dismissUpdate', (event, version: string) => {
  dismissUpdate(version);
});

ipcMain.on('app:settings:dismissChangelog', () => {
  dismissChangelog();
});

ipcMain.on('app:settings:checkUpdates', (event) => {
  const settings = getSettings();

  const updateDismissed = settings.appState?.updateDismissed ?? null;
  checkUpdates(updateDismissed)
    .then((updateInfo) => {
      if (updateInfo) {
        event.reply('app:settings:updateInfo', updateInfo);
      }
    })
    .catch(() => {});
});
