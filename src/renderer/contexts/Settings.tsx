import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { ChannelPlaylistType, Settings } from 'main/types/Settings';
import { defaults } from 'main/store/defaults';
import { mergeDeep } from 'renderer/helpers';

interface SettingsContextInterface {
  settings: Settings;
  updateSetting: (key: string, value: unknown) => Promise<unknown>;
  updateSettings: (value: Settings) => Promise<unknown>;
  resetSettings: (key: keyof Settings) => Promise<unknown>;
  updatePlaylist: (
    label: string,
    type: ChannelPlaylistType,
    entries: string[],
  ) => Promise<unknown>;
}

const SettingsContext = React.createContext<SettingsContextInterface | null>(
  null,
);

type Props = {
  children: React.ReactNode;
};

const SettingsProvider: React.FC<Props> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaults.settings);
  const [inited, setInited] = useState<boolean>(false);

  const onSettingsChange = useCallback(
    (s: Settings) => {
      const newSettings = mergeDeep(defaults.settings, s);
      setSettings(newSettings);
      setInited(true);
    },
    [setSettings],
  );

  const updateSetting = useCallback(
    (key: string, value: unknown) =>
      window.app.settings.updateSetting(key, value),
    [],
  );

  const updateSettings = useCallback(
    (value: Settings) => window.app.settings.updateSettings(value),
    [],
  );

  const resetSettings = useCallback(
    (key: keyof Settings) => window.app.settings.reset(key),
    [],
  );

  const updatePlaylist = useCallback(
    (label: string, type: ChannelPlaylistType, entries: string[]) =>
      window.app.playlists.update(label, type, entries),
    [],
  );

  useEffect(() => {
    window.app.settings
      .getSettings()
      .then(onSettingsChange)
      .catch(() => {});

    const offSettingsChange =
      window.app.settings.onSettingsChange(onSettingsChange);

    return () => {
      offSettingsChange();
    };
  }, [onSettingsChange]);

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      updatePlaylist,
    }),
    [settings, updateSetting, updateSettings, resetSettings, updatePlaylist],
  );

  return (
    <SettingsContext.Provider value={value}>
      {inited ? children : null}
    </SettingsContext.Provider>
  );
};
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(`useSettings must be used within a SettingsProvider`);
  }
  return context;
};

export const useWindow = (id: number | null) => {
  const { settings, updateSetting } = useSettings();

  const windowIndex: number = useMemo(() => {
    if (!settings) return -1;

    if (Array.isArray(settings.windows)) {
      return settings.windows.findIndex((window) => window.id === id);
    }

    return -1;
  }, [id, settings]);

  const windowSettings =
    windowIndex > -1
      ? settings.windows[windowIndex]
      : defaults.settings.windows[0];

  const updateWindowSetting = useCallback(
    (setting: string, value: unknown) =>
      windowIndex > -1
        ? updateSetting(`windows.${windowIndex}.${setting}`, value)
        : null,
    [windowIndex, updateSetting],
  );

  const updateWindowSettings = useCallback(
    (value: Settings['windows']) =>
      windowIndex > -1 ? updateSetting(`windows.${windowIndex}`, value) : null,
    [windowIndex, updateSetting],
  );

  const resetWindowSettings = useCallback(
    () =>
      windowIndex > -1
        ? updateSetting(`windows.${windowIndex}`, {
            ...defaults.settings.windows[0],
            id,
          })
        : null,
    [windowIndex, id, updateSetting],
  );

  const deleteWindow = useCallback(
    () =>
      updateSetting(
        'windows',
        settings.windows.filter((w) => w.id !== id),
      ),
    [id, settings, updateSetting],
  );

  const value = useMemo(
    () => ({
      windowSettings,
      windowIndex,
      updateWindowSetting,
      updateWindowSettings,
      resetWindowSettings,
      deleteWindow,
    }),
    [
      windowSettings,
      windowIndex,
      updateWindowSetting,
      updateWindowSettings,
      resetWindowSettings,
      deleteWindow,
    ],
  );

  return value;
};

export default SettingsProvider;
