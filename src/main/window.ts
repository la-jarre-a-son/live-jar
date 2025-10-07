import path from 'path';
import {
  screen,
  app,
  BrowserWindow,
  shell,
  session,
  Rectangle,
} from 'electron';
import {
  deepEqual,
  extractAccessToken,
  getAssetPath,
  resolveHtmlPath,
} from './util';

import { store } from './store';
import {
  Settings,
  StreamWindow,
  StreamWindowState,
  TwitchStreamWindow,
  WindowState,
} from './types';
import {
  addToPlaylist,
  clearAuthToken,
  deletePlaylist,
  getSettings,
  setAuthToken,
} from './settings';

export const DEFAULT_WINDOW_WIDTH = 640;
export const DEFAULT_WINDOW_HEIGHT = 480;
export const DEFAULT_WINDOW_MIN_WIDTH = 320;
export const DEFAULT_WINDOW_MIN_HEIGHT = 240;

const DEFAULT_WINDOW_STATE: StreamWindowState = {
  enabled: true,
  width: 640,
  height: 480,
  alwaysOnTop: false,
  maximized: false,
  locked: false,
  muted: false,
  ignoreSolo: false,
};

const DEFAULT_TWITCH_WINDOW: StreamWindow = {
  id: 0,
  label: 'default',
  type: 'twitch',
  url: 'https://player.twitch.tv/?channel=la_jarre_a_son&parent=localhost',
  channel: 'la_jarre_a_son',
  quality: 'auto',
  state: null,
  volume: 1.0,
};

const browserWindows: Map<number, BrowserWindow> = new Map();
let appQuiting = false;

export function setAppQuiting() {
  appQuiting = true;
}

export function getOpenWindowIds(): number[] {
  return Array.from(browserWindows.keys());
}

export function getChildWindow(id: number): BrowserWindow | undefined {
  return browserWindows.get(id);
}

export function getWindows(): StreamWindow[] {
  return store.get('settings.windows') as StreamWindow[];
}

export function setWindows(windows: StreamWindow[]) {
  store.set('settings.windows', windows);
}

export function getWindow(id: number): StreamWindow | undefined {
  const windows = getWindows();
  const window = windows.find((w: StreamWindow) => w.id === id);

  return window;
}

export function updateWindow(id: number, data: Partial<StreamWindow>): void {
  const windows = getWindows();
  const window = windows.find((w: StreamWindow) => w.id === id);

  if (!window) return;

  const newWindow = { ...window, ...data };

  if (
    newWindow.type === 'twitch' &&
    (data as Partial<TwitchStreamWindow>).channel
  ) {
    addToPlaylist(
      'recent',
      'twitch',
      (newWindow as TwitchStreamWindow).channel,
    );
  }

  store.set(
    'settings.windows',
    windows.map((w) => (w.id === id ? newWindow : w)),
  );
}

export function updateWindowState(
  id: number,
  data: Partial<StreamWindowState>,
): void {
  const windows = getWindows();
  const window = windows.find((w: StreamWindow) => w.id === id);

  if (!window) return;

  const newWindowState = { ...(window.state || DEFAULT_WINDOW_STATE), ...data };

  store.set(
    'settings.windows',
    windows.map((w) =>
      w.id === id ? { ...window, state: newWindowState } : w,
    ),
  );
}

export function addWindow(window: StreamWindow): void {
  const id = window.id ?? null;
  if (id === null) return;

  const windows = getWindows().filter((w) => w.id !== id);

  if (!window) return;

  store.set('settings.windows', [...windows, window]);
}

export function getWindowState(id: number | null): WindowState {
  if (id !== null) {
    const window = getWindow(id);
    if (!window) return DEFAULT_WINDOW_STATE;
    const state = window.state ?? DEFAULT_WINDOW_STATE;
    return state;
  }

  const settings = getSettings();

  const state = settings.windowState ?? DEFAULT_WINDOW_STATE;
  return state;
}

export function onChildWindowStateChange(
  id: number,
  callback: (newValue?: WindowState, oldValue?: WindowState) => void,
): () => void {
  return store.onDidChange(
    'settings',
    (newValue?: Settings, oldValue?: Settings) => {
      const oldWindow = oldValue?.windows.find((w) => w.id === id);
      const newWindow = newValue?.windows.find((w) => w.id === id);

      if (!deepEqual(newWindow?.state, oldWindow?.state)) {
        callback(newWindow?.state ?? undefined, oldWindow?.state ?? undefined);
      }
    },
  );
}

function isWindowInDisplay(wB: Rectangle, dB: Rectangle) {
  return (
    wB.x >= dB.x &&
    wB.y >= dB.y &&
    wB.x + wB.width <= dB.x + dB.width &&
    wB.y + wB.height <= dB.y + dB.height
  );
}

export function getWindowBoundsOnDisplay(id: number | null) {
  const { x, y, width, height } = getWindowState(id);

  if (
    typeof x === 'number' &&
    typeof y === 'number' &&
    typeof width === 'number' &&
    typeof height === 'number'
  ) {
    const bounds = { x, y, width, height };
    if (
      screen.getAllDisplays().some((display) => {
        return isWindowInDisplay(bounds, display.bounds);
      })
    ) {
      return bounds;
    }
  }

  return {
    x: undefined,
    y: undefined,
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
  };
}

function bindChildWindowEvents(window: BrowserWindow, id: number) {
  window.on('closed', () => {
    if (!appQuiting) {
      updateWindowState(id, { enabled: false });
    }
  });
  window.on('moved', () => {
    const { x, y, width, height } = window.getBounds();
    updateWindowState(id, { x, y, width, height });
  });
  window.on('resized', () => {
    const { x, y, width, height } = window.getBounds();
    updateWindowState(id, { x, y, width, height });
  });
  window.on('maximize', () => {
    updateWindowState(id, { maximized: true });
  });
  window.on('unmaximize', () => {
    updateWindowState(id, { maximized: false });
  });
  window.on('always-on-top-changed', (_event, isAlwaysOnTop) => {
    updateWindowState(id, { alwaysOnTop: isAlwaysOnTop });
  });

  onChildWindowStateChange(id, (state?: WindowState) => {
    const win = browserWindows.get(id);
    if (state && win) {
      win.webContents.send('app:window:state', state);
    }
  });
}

const createWindow = async (id: number) => {
  const window = getWindow(id);

  if (!window) return;

  const winBounds = getWindowBoundsOnDisplay(id);

  const childWindow = new BrowserWindow({
    show: false,
    width: winBounds.width,
    height: winBounds.height,
    x: winBounds.x,
    y: winBounds.y,
    icon: getAssetPath('icon.png'),
    frame: false,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: true,
      autoplayPolicy: 'no-user-gesture-required',
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  childWindow.loadURL(resolveHtmlPath('child.html', `id=${id}`));

  childWindow.on('ready-to-show', () => {
    if (!childWindow) {
      throw new Error('"childWindow" is not defined');
    }
    childWindow.show();
    childWindow.focus();

    if (window.state?.maximized) {
      childWindow.maximize();
    }

    if (window.state?.alwaysOnTop) {
      childWindow.setAlwaysOnTop(true, 'floating');
    }

    if (window.state?.locked) {
      childWindow.resizable = false;
      childWindow.movable = false;
    }

    if (window.state?.muted) {
      childWindow.webContents.setAudioMuted(true);
    }
  });

  childWindow.on('closed', () => {
    browserWindows.delete(id);
  });

  // Open urls in the user's browser
  childWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  childWindow.webContents.session.webRequest.onHeadersReceived(
    { urls: ['*://*/*'] },
    (d, c) => {
      if (d.responseHeaders) {
        if (d.responseHeaders['X-Frame-Options']) {
          delete d.responseHeaders['X-Frame-Options'];
        } else if (d.responseHeaders['x-frame-options']) {
          delete d.responseHeaders['x-frame-options'];
        } else if (
          d.responseHeaders['content-security-policy'] &&
          d.responseHeaders['content-security-policy']
        ) {
          d.responseHeaders['content-security-policy'] = d.responseHeaders[
            'content-security-policy'
          ].map((csp) =>
            csp.startsWith('frame-ancestors')
              ? 'frame-ancestors filesystem: file: http://localhost:* https://localhost:*'
              : csp,
          );
        } else if (d.responseHeaders['Content-Security-Policy']) {
          d.responseHeaders['Content-Security-Policy'] = d.responseHeaders[
            'Content-Security-Policy'
          ].map((csp) =>
            csp.startsWith('frame-ancestors')
              ? 'frame-ancestors filesystem: file: http://localhost:* https://localhost:*'
              : csp,
          );
        }
      }

      c({ cancel: false, responseHeaders: d.responseHeaders });
    },
  );

  bindChildWindowEvents(childWindow, id);

  browserWindows.set(id, childWindow);
  updateWindowState(id, { enabled: true });
};

const openChildWindow = (id: number) => {
  const childWindow = browserWindows.get(id);
  if (childWindow) {
    if (childWindow.isMinimized()) childWindow.restore();
    childWindow.focus();
  } else {
    createWindow(id);
  }
};

const closeChildWindow = (id: number) => {
  const childWindow = browserWindows.get(id);
  if (childWindow) {
    childWindow.close();
    browserWindows.delete(id);
  }
};

const applyState = (id: number, state: StreamWindowState) => {
  const childWindow = browserWindows.get(id);
  if (childWindow) {
    const bounds = {
      x: state.x,
      y: state.y,
      width: state.width,
      height: state.height,
    };
    childWindow.setBounds(bounds);
    if (state.maximized) {
      childWindow.maximize();
    } else {
      childWindow.unmaximize();
    }
    childWindow.setAlwaysOnTop(state.alwaysOnTop, 'floating');
    childWindow.resizable = !state.locked;
    childWindow.movable = !state.locked;
    childWindow.webContents.setAudioMuted(state.muted);
  }
};

export const openWindow = (id: number) => {
  openChildWindow(id);
};

export const openAllWindows = () => {
  const settings = getSettings();
  const windows = getWindows();

  if (settings.general.reopenWindows) {
    windows.forEach((w) => {
      if (w.state && w.state.enabled) openWindow(w.id);
    });
  } else {
    windows.forEach((w) => {
      updateWindowState(w.id, { enabled: false });
    });
  }
};

const getNextWindowId = () => {
  const lastWindowId = getWindows().reduce(
    (lastId, w) => (w.id > lastId ? w.id : lastId),
    -1,
  );

  return lastWindowId + 1;
};

export const addStream = (window: Partial<StreamWindow>) => {
  const id = getNextWindowId();

  if (window.type === 'twitch') {
    const newWindow: TwitchStreamWindow = {
      ...DEFAULT_TWITCH_WINDOW,
      id,
      ...window,
    };

    if (newWindow.channel) {
      addToPlaylist('recent', 'twitch', newWindow.channel);
      newWindow.url = `https://player.twitch.tv/?channel=${
        newWindow.channel
      }&parent=localhost`;
    }

    addWindow(newWindow);
    openChildWindow(id);
  } else {
    /* TODO */
  }
};

export function removeStream(id: number) {
  if (id === null) return;

  const windows = getWindows().filter((w) => w.id !== id);

  store.set('settings.windows', windows);
  closeChildWindow(id);
}

export function switchStreams(id: number, targetId: number) {
  const currentWindow = getWindow(id);
  const targetWindow = getWindow(targetId);

  if (!currentWindow?.state?.enabled || !targetWindow?.state?.enabled) return;

  const newCurrentWindow = {
    ...currentWindow,
    label: targetWindow.label,
    state: targetWindow.state,
  };
  const newTargetWindow = {
    ...targetWindow,
    label: currentWindow.label,
    state: currentWindow.state,
  };
  const windows = getWindows().map((w) =>
    w.id === id ? newTargetWindow : w.id === targetId ? newCurrentWindow : w,
  );
  store.set('settings.windows', windows);

  applyState(id, targetWindow.state);
  applyState(targetId, currentWindow.state);
}

// export const loginTwitch = () => {
//   let loginWindow = new BrowserWindow({
//     show: false,
//     width: 320,
//     height: 480,
//     icon: getAssetPath('icon.png'),
//   });

//   loginWindow.loadURL('https://twitch.tv/login?popup=true');

//   loginWindow.on('ready-to-show', () => {
//     if (!loginWindow) {
//       throw new Error('"loginWindow" is not defined');
//     }

//     loginWindow.show();
//   });
// }

export const loginTwitch = () => {
  const loginWindow = new BrowserWindow({
    show: false,
    width: 480,
    height: 640,
    icon: getAssetPath('icon.png'),
  });

  const CLIENT_ID = '047jczcyedth9awq0kcnv6m04175iy';
  const scopes = ['user:read:follows', 'user:read:subscriptions'].join(' ');
  const redirectUri = 'https://live-jar.ljas.fr/auth/twitch';
  loginWindow.loadURL(
    `https://id.twitch.tv/oauth2/authorize?client_id=${
      CLIENT_ID
    }&scope=${encodeURIComponent(
      scopes,
    )}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`,
  );

  loginWindow.on('ready-to-show', () => {
    if (!loginWindow) {
      throw new Error('"loginWindow" is not defined');
    }

    loginWindow.show();
  });

  loginWindow.webContents.on('will-navigate', (_event, newUrl) => {
    if (newUrl.startsWith(redirectUri)) {
      const token = extractAccessToken(newUrl);
      setAuthToken('twitch', token);
      // More complex code to handle tokens goes here
      loginWindow.close();
    }
  });

  loginWindow.setMenu(null);
};

export const logoutTwitch = () => {
  session.defaultSession.clearStorageData({ origin: 'twitch.tv' });
  clearAuthToken('twitch');
  deletePlaylist('followed', 'twitch');
};

// WINDOW STATE

export function setAlwaysOnTop(flag: boolean) {
  return store.set('settings.windowState.alwaysOnTop', flag);
}

export function setMaximized(maximized: boolean) {
  return store.set('settings.windowState.maximized', maximized);
}

export function saveMainWindowState(window: BrowserWindow) {
  const previousState = store.get('settings.windowState') as WindowState;

  const { x, y, height, width } = window.getNormalBounds();

  // const path = getURLHash(window.webContents.getURL());
  const maximized = window.isMaximized();
  const alwaysOnTop = window.isAlwaysOnTop();

  store.set('settings.windowState', {
    ...previousState,
    x,
    y,
    width,
    height,
    maximized,
    alwaysOnTop,
  });
}

export function onMainWindowStateChange(
  callback: (newValue?: WindowState, oldValue?: WindowState) => void,
): () => void {
  return store.onDidChange(
    'settings',
    (newValue?: Settings, oldValue?: Settings) => {
      if (
        oldValue?.windowState.maximized !== newValue?.windowState.maximized ||
        oldValue?.windowState.alwaysOnTop !== newValue?.windowState.alwaysOnTop
      ) {
        callback(newValue?.windowState, oldValue?.windowState);
      }
    },
  );
}
