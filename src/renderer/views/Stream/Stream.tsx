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

  const handleDoubleClick = useCallback(
    ({
      altKey,
      shiftKey,
      ctrlKey,
    }: {
      altKey: boolean;
      shiftKey: boolean;
      ctrlKey: boolean;
    }) => {
      let action = 'none';

      if (shiftKey && !altKey && !ctrlKey) {
        action = settings.general.doubleClickShiftAction;
      } else if (altKey && !shiftKey && !ctrlKey) {
        action = settings.general.doubleClickAltAction;
      } else if (ctrlKey && !shiftKey && !altKey) {
        action = settings.general.doubleClickCtrlAction;
      } else if (!shiftKey && !altKey && !ctrlKey) {
        action = settings.general.doubleClickAction;
      }

      if (windowId) {
        if (action === 'mute') {
          setState(windowId, { muted: !windowState.muted });
        }
        if (action === 'solo') {
          window.app.window.solo(windowId as number);
        }
        if (action === 'maximize') {
          toggleMaximize();
        }
        if (action === 'reload') {
          window.location.reload();
        }
        if (action === 'switchWithMain') {
          window.app.stream.switchWithMain(windowId);
        }
      }
    },
    [setState, settings.general, toggleMaximize, windowId, windowState.muted],
  );

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
