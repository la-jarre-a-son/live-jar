import { useCallback, useEffect, useRef } from 'react';
import classnames from 'classnames/bind';

import { StreamWindow } from 'main/types';

import { useWindowState } from 'renderer/contexts/WindowState';
import { useSettings, useWindow } from 'renderer/contexts/Settings';
import styles from './Stream.module.scss';
import TwitchStream from './TwitchStream';
import TopBar from './TopBar';

const cx = classnames.bind(styles);

const INACTIVE_TIMEOUT = 4000;

export default function Stream() {
  const inactiveTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const { windowId, windowState, toggleMaximize, setState } = useWindowState();
  const { settings } = useSettings();
  const { windowSettings } = useWindow(windowId as number);

  const handleStreamUpdate = useCallback(
    (streamWindow: Partial<StreamWindow>) => {
      window.app.stream.update(windowId as number, streamWindow);
    },
    [windowId],
  );

  const handleActive = useCallback(() => {
    document.body.classList.remove(cx('inactive'));
    if (inactiveTimeout.current) clearTimeout(inactiveTimeout.current);
    inactiveTimeout.current = setTimeout(() => {
      document.body.classList.add(cx('inactive'));
    }, INACTIVE_TIMEOUT);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (settings.general.doubleClickAction === 'mute') {
      setState(windowId, { muted: !windowState.muted });
    }
    if (settings.general.doubleClickAction === 'solo') {
      window.app.window.solo(windowId as number);
    }
    if (settings.general.doubleClickAction === 'maximize') {
      toggleMaximize();
    }
  }, [
    setState,
    settings.general.doubleClickAction,
    toggleMaximize,
    windowId,
    windowState.muted,
  ]);

  useEffect(() => {
    handleActive();
    document.addEventListener('mousemove', handleActive);
    return () => {
      document.removeEventListener('mousemove', handleActive);
    };
  }, [handleActive]);

  useEffect(() => {
    if (windowSettings) {
      document.title = `[${windowSettings.label}] ${
        windowSettings.type === 'twitch'
          ? windowSettings.channel
          : new URL(windowSettings.url).hostname
      } - Live Jar`;
    }
  }, [windowSettings]);

  return (
    <div className={cx('base')}>
      {windowSettings && (
        <TopBar
          topbarStyle={settings.general.topbarStyle}
          windowSettings={windowSettings}
        />
      )}
      {windowSettings && windowSettings.type === 'twitch' ? (
        <TwitchStream
          streamWindow={windowSettings}
          onStreamUpdate={handleStreamUpdate}
          onActive={handleActive}
          onDoubleClick={handleDoubleClick}
          mutePrerollTimeout={settings.general.mutePrerollTimeout}
          volumeScrollSpeed={settings.general.volumeScrollSpeed}
          autoRefreshHighLatency={settings.general.autoRefreshHighLatency}
        />
      ) : null}
    </div>
  );
}
