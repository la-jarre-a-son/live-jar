/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, Tray, Menu, nativeImage, shell } from 'electron';
import MenuBuilder from './menu';
import { getAssetPath, resolveHtmlPath } from './util';
import { bindMainWindowEvents } from './api';
import {
  DEFAULT_WINDOW_MIN_HEIGHT,
  DEFAULT_WINDOW_MIN_WIDTH,
  getWindowBoundsOnDisplay,
  getWindowState,
  openAllWindows,
  saveMainWindowState,
  setAppQuiting,
} from './window';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default({ showDevTools: false });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const windowState = getWindowState(null);

  const winBounds = getWindowBoundsOnDisplay(null);

  mainWindow = new BrowserWindow({
    show: false,
    x: winBounds.x ?? undefined,
    y: winBounds.y ?? undefined,
    width: winBounds.width,
    height: winBounds.height,
    minWidth: DEFAULT_WINDOW_MIN_WIDTH,
    minHeight: DEFAULT_WINDOW_MIN_HEIGHT,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 14 },
  });

  mainWindow.loadURL(resolveHtmlPath('main.html', '', '/'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    if (windowState.maximized) {
      mainWindow.maximize();
    }

    if (windowState.alwaysOnTop) {
      mainWindow.setAlwaysOnTop(true, 'floating');
    }
  });

  mainWindow.on('close', () => {
    if (mainWindow) {
      saveMainWindowState(mainWindow);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
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

  bindMainWindowEvents(mainWindow);
};

const openMainWindow = () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    app.focus({ steal: true });
  } else {
    createWindow();
  }
  app.dock?.show();
};

const firstOpenWindow = () => {
  openMainWindow();
};

const createTray = () => {
  const icon = nativeImage.createFromPath(getAssetPath('icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open App',
      click: () => {
        openMainWindow();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.on('click', () => openMainWindow());
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Live Jar');
};

app.on('window-all-closed', () => {
  // Do not close app
  app.dock?.hide();
});

app.on('before-quit', (_event) => {
  setAppQuiting();
  tray?.destroy();
});

process.on('SIGINT', () => {
  setAppQuiting();
  console.log('SIGINT');
  app.quit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  setAppQuiting();
  console.log('SIGTERM');
  app.quit();
  process.exit(0);
});

app
  .whenReady()
  .then(() => {
    createWindow();
    firstOpenWindow();
    createTray();
    openAllWindows();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
