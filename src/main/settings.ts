import {
  AuthProvider,
  AuthToken,
  ChannelPlaylistType,
  Settings,
} from './types';

import { defaults, store } from './store';

export function getSettings(): Settings {
  return store.get('settings');
}

export function updateSettings(settings: Settings) {
  store.set('settings', settings);
}

export function updateSetting(key: string, value: unknown) {
  store.set(`settings.${key}`, value);
}

export function onSettingsChange(
  callback: (newValue?: Settings, oldValue?: Settings) => void,
): () => void {
  return store.onDidChange('settings', callback);
}

export function resetSettings(key: keyof Settings) {
  return store.set(`settings.${key}`, defaults.settings[key]);
}

export function clearSettings() {
  return store.clear();
}

export function setAuthToken(provider: AuthProvider, token: AuthToken | null) {
  updateSetting(`auth.${provider}`, token);
}

export function clearAuthToken(provider: AuthProvider) {
  updateSetting(`auth.${provider}`, null);
}

// PLAYLISTS

export function getPlaylists() {
  const settings = getSettings();

  return settings.playlists;
}

export function addToPlaylist(
  label: string,
  type: ChannelPlaylistType,
  entry: string,
) {
  const entries = entry
    .trim()
    .split(/[\s,]/)
    .map((e) => e.toLowerCase())
    .filter(Boolean);
  const settings = getSettings();
  const newList = settings.playlists.find(
    (p) => p.label === label && p.type === type,
  );

  if (newList) {
    newList.entries = [...new Set([...entries, ...newList.entries])];
    const playlists = settings.playlists.map((p) =>
      p.type === type && p.label === label ? newList : p,
    );

    updateSetting('playlists', playlists);
  } else {
    const newPlaylist = {
      label,
      type,
      entries,
    };
    const playlists = [...settings.playlists, newPlaylist];

    updateSetting('playlists', playlists);
  }
}

export function removeFromPlaylist(
  label: string,
  type: ChannelPlaylistType,
  entry: string,
) {
  const settings = getSettings();
  const existingList = settings.playlists.find(
    (p) => p.label === label && p.type === type,
  );

  if (existingList) {
    existingList.entries = existingList.entries.filter((e) => e !== entry);
    const playlists = settings.playlists.map((p) =>
      p.type === type && p.label === label ? existingList : p,
    );

    updateSetting('playlists', playlists);
  }
}

export function updatePlaylist(
  label: string,
  type: ChannelPlaylistType,
  entries: string[],
) {
  const settings = getSettings();
  const newList = settings.playlists.find(
    (p) => p.label === label && p.type === type,
  );

  if (newList) {
    newList.entries = [...new Set(entries)];
    const playlists = settings.playlists.map((p) =>
      p.type === type && p.label === label ? newList : p,
    );

    updateSetting('playlists', playlists);
  } else {
    const newPlaylist = {
      label,
      type,
      entries,
    };
    const playlists = [...settings.playlists, newPlaylist];

    updateSetting('playlists', playlists);
  }
}

export function deletePlaylist(label: string, type: ChannelPlaylistType) {
  const settings = getSettings();
  const playlists = settings.playlists.filter(
    (p) => !(p.label === label && p.type === type),
  );

  updateSetting('playlists', playlists);
}
