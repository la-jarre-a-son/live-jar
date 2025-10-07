import { UpdateCheckResult, autoUpdater } from 'electron-updater';
import { gt } from 'semver';

import { AppState, Settings, UpdateInfo } from './types';
import packageJson from '../../package.json';

import { store } from './store';
import { deepEqual } from './util';

autoUpdater.fullChangelog = true;
autoUpdater.requestHeaders = { Accept: 'application/json' };
autoUpdater.autoDownload = false;
const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
if (isDevelopment) {
  autoUpdater.forceDevUpdateConfig = true;
}

let updateCheck: null | UpdateCheckResult = null;

export async function checkUpdates(
  minVersion?: string | null,
): Promise<UpdateInfo | null> {
  updateCheck = updateCheck ?? (await autoUpdater.checkForUpdates());
  if (updateCheck) {
    if (gt(updateCheck.updateInfo.version, minVersion ?? packageJson.version)) {
      return {
        version: updateCheck.updateInfo.version,
        releaseDate: updateCheck.updateInfo.releaseDate,
        releaseName: updateCheck.updateInfo.releaseName,
        releaseNotes: Array.isArray(updateCheck.updateInfo.releaseNotes)
          ? updateCheck.updateInfo.releaseNotes.join('\n')
          : updateCheck.updateInfo.releaseNotes,
      };
    }
  }
  return null;
}

export function dismissChangelog() {
  return store.set('settings.appState.changelogDismissed', packageJson.version);
}

export function dismissUpdate(version: string) {
  return store.set('settings.appState.updateDismissed', version);
}

export function onAppStateChange(
  callback: (newValue?: AppState, oldValue?: AppState) => void,
): () => void {
  return store.onDidChange(
    'settings',
    (newValue?: Settings, oldValue?: Settings) => {
      if (!deepEqual(newValue?.appState, oldValue?.appState)) {
        callback(newValue?.appState, oldValue?.appState);
      }
    },
  );
}
