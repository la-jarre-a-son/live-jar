// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { UpdateInfo } from 'electron-updater';
import {
  ChannelPlaylistType,
  Settings,
  StreamWindow,
  StreamWindowState,
} from './types';

export type Channels = 'ipc-example' | 'open-stream' | 'twitch-login';

const registerListener =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (channel: string) => (func: (...args: any[]) => void) => {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      func(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  };

export const AppApi = {
  quit: () => ipcRenderer.send('app:quit'),
  login: () => ipcRenderer.send('app:login'),
  logout: () => ipcRenderer.send('app:logout'),
  settings: {
    clear: () => ipcRenderer.send('app:settings:clear'),
    reset: (key: keyof Settings) =>
      ipcRenderer.invoke('app:settings:reset', key),
    getSettings: () => ipcRenderer.invoke('app:settings:getSettings'),
    updateSetting: (key: string, value: unknown) =>
      ipcRenderer.invoke('app:settings:updateSetting', key, value),
    updateSettings: (value: Settings) =>
      ipcRenderer.invoke('app:settings:updateSettings', value),
    onSettingsChange: (callback: (settings: Settings) => void) =>
      registerListener('app:settings')(callback),
    checkUpdates: () => ipcRenderer.send('app:settings:checkUpdates'),
    dismissUpdate: (version: string) =>
      ipcRenderer.send('app:settings:dismissUpdate', version),
    dismissChangelog: () => ipcRenderer.send('app:settings:dismissChangelog'),
    onUpdateInfo: (callback: (info: UpdateInfo) => void) =>
      registerListener('app:settings:updateInfo')(callback),
  },
  stream: {
    list: () => ipcRenderer.invoke('app:stream:list'),
    add: (window: Partial<StreamWindow>) =>
      ipcRenderer.invoke('app:stream:add', window),
    update: (id: number, data: Partial<StreamWindow>) =>
      ipcRenderer.invoke('app:stream:update', id, data),
    delete: (id: number) => ipcRenderer.send('app:stream:delete', id),
    switch: (id: number, targetId: number) =>
      ipcRenderer.send('app:stream:switch', id, targetId),
  },
  playlists: {
    list: () => ipcRenderer.invoke('app:playlist:list'),
    update: (label: string, type: ChannelPlaylistType, entries: string[]) =>
      ipcRenderer.invoke('app:playlist:update', label, type, entries),
    delete: (label: string, type: ChannelPlaylistType) =>
      ipcRenderer.invoke('app:playlist:delete', label, type),
    add: (label: string, type: ChannelPlaylistType, entry: string) =>
      ipcRenderer.invoke('app:playlist:add', label, type, entry),
    remove: (label: string, type: ChannelPlaylistType, entry: string) =>
      ipcRenderer.invoke('app:playlist:remove', label, type, entry),
  },
  window: {
    get: (id: number): Promise<StreamWindow> =>
      ipcRenderer.invoke('app:window:get', id),
    open: (id: number) => ipcRenderer.send('app:window:open', id),
    close: (id: number | null) => ipcRenderer.send('app:window:close', id),
    minimize: () => ipcRenderer.send('app:window:minimize'),
    maximize: () => ipcRenderer.send('app:window:maximize'),
    unmaximize: () => ipcRenderer.send('app:window:unmaximize'),
    titleBarDoubleClick: () =>
      ipcRenderer.send('app:window:titleBarDoubleClick'),
    solo: (id: number) => ipcRenderer.send('app:window:solo', id),
    getState: (id: number | null) =>
      ipcRenderer.send('app:window:getState', id),
    setState: (id: number | null, state: Partial<StreamWindowState>) =>
      ipcRenderer.send('app:window:setState', id, state),
    onStateChange: (callback: (state: StreamWindowState) => void) =>
      registerListener('app:window:state')(callback),
  },
};

export const OsApi = {
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  platform: process.platform,
};

if (process.isMainFrame) {
  contextBridge.exposeInMainWorld('app', AppApi);
  contextBridge.exposeInMainWorld('os', OsApi);
} else if (window.parent) {
  window.addEventListener('wheel', (event: WheelEvent) => {
    window.parent.postMessage(
      {
        eventName: 'wheel',
        namespace: 'live-jar',
        params: { deltaX: event.deltaX, deltaY: event.deltaY },
      },
      '*',
    );
  });
  window.addEventListener('mousemove', () => {
    window.parent.postMessage(
      { eventName: 'mousemove', namespace: 'live-jar' },
      '*',
    );
  });
  window.addEventListener('dblclick', (event) => {
    window.parent.postMessage(
      {
        eventName: 'dblclick',
        namespace: 'live-jar',
        params: {
          targetId: (event.target as HTMLElement).id,
          targetClassName: (event.target as HTMLElement).className,
        },
      },
      '*',
    );
  });
}
