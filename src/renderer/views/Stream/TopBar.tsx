import React from 'react';
import classnames from 'classnames/bind';

import {
  Badge,
  Button,
  ButtonGroup,
  Icon,
  Stack,
  ToggleButton,
  Toolbar,
} from '@la-jarre-a-son/ui';

import { useWindowState } from 'renderer/contexts/WindowState';

import { useStreamStats } from 'renderer/contexts/StreamStats';
import { StreamWindow } from 'main/types';
import TrafficLightButtons from './TrafficLightButtons';

import styles from './Stream.module.scss';

const cx = classnames.bind(styles);

type Props = {
  windowSettings: StreamWindow;
  topbarStyle: 'solid' | 'transparent' | 'hidden';
};

const TopBar: React.FC<Props> = ({ topbarStyle, windowSettings }) => {
  const { windowState, titleBarDoubleClick, setState } = useWindowState();
  const { latency, fps, latencyHighThreshold } = useStreamStats();

  const handleSolo = () => {
    window.app.window.solo(windowSettings.id);
  };

  const toggleAlwaysOnTop = () => {
    setState(windowSettings.id, { alwaysOnTop: !windowState.alwaysOnTop });
  };

  const toggleIgnoreSolo = () => {
    setState(windowSettings.id, {
      ignoreSolo: !windowState.ignoreSolo,
    });
  };

  const toggleMuted = () => {
    setState(windowSettings.id, {
      muted: !windowState.muted,
    });
  };

  const handleReload = () => window.location.reload();

  return (
    <Toolbar
      position={topbarStyle === 'solid' ? 'relative' : 'fixed'}
      as={Stack}
      elevation={0}
      className={cx('topbar', {
        'topbar--isMac': window.os?.isMac,
        locked: windowState.locked,
        autoHide: topbarStyle === 'hidden',
      })}
    >
      <ButtonGroup>
        <Button
          onClick={handleSolo}
          size="sm"
          aria-label="Solo"
          intent="success"
          hoverIntent
          icon
        >
          S
        </Button>
        <ToggleButton
          selected={windowState.ignoreSolo}
          onClick={toggleIgnoreSolo}
          size="sm"
          selectedIntent="warning"
          aria-label="Ignore Solo"
          icon
        >
          I
        </ToggleButton>
        <ToggleButton
          selected={windowState.muted}
          onClick={toggleMuted}
          size="sm"
          selectedIntent="danger"
          aria-label="Mute"
          icon
        >
          M
        </ToggleButton>
      </ButtonGroup>
      <div className={cx('titlebar')} onDoubleClick={titleBarDoubleClick}>
        <div className={cx('stats')}>
          <Badge
            size="sm"
            intent={
              latency && latency > latencyHighThreshold ? 'error' : 'primary'
            }
          >
            {Number(latency).toFixed(2)}s
          </Badge>
          <Badge size="sm" intent="neutral">
            {Number(fps).toFixed(0)}fps
          </Badge>
        </div>
        <div
          className={cx('title', {
            muted: windowState.muted || windowSettings.volume === 0,
            unmuted: !windowState.muted && windowSettings.volume === 1,
          })}
        >
          [{windowSettings.label}]
          {windowSettings.type === 'twitch' ? ` ${windowSettings.channel}` : ''}
        </div>
      </div>
      <ButtonGroup className={cx('actions')}>
        <ToggleButton
          size="sm"
          selectedIntent="warning"
          onClick={toggleAlwaysOnTop}
          selected={windowState.alwaysOnTop}
          aria-label="Always on Top"
          icon
        >
          <Icon name="fi fi-rr-thumbtack" />
        </ToggleButton>
        <Button
          size="sm"
          aria-label="Reload"
          onClick={handleReload}
          intent="primary"
          icon
          hoverIntent
        >
          <Icon name="fi fi-rr-refresh" />
        </Button>
      </ButtonGroup>
      {window.os?.isWindows && !windowState.locked && (
        <TrafficLightButtons
          className={cx('trafficLights')}
          windowId={windowSettings.id}
        />
      )}
      {windowState.locked && <Icon name="fi fi-rr-lock" />}
    </Toolbar>
  );
};

export default TopBar;
