import classnames from 'classnames/bind';
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { StreamWindow } from 'main/types';

import { FormControlLabel, Switch } from '@la-jarre-a-son/ui';
import styles from './Chat.module.scss';

const cx = classnames.bind(styles);

export function Chat() {
  const [windows, setWindows] = useState<StreamWindow[]>([]);
  const [onlyEnabled, setOnlyEnabled] = useState(true);

  const getChannels = () => {
    window.app.stream
      .list()
      .then((w) => {
        setWindows(w);
        return true;
      })
      .catch(() => {});
  };

  const list = useMemo(() => {
    if (onlyEnabled) {
      return windows.filter((w) => w.state && w.state.enabled);
    }
    return windows;
  }, [windows, onlyEnabled]);

  useEffect(() => {
    getChannels();
  }, []);

  return (
    <div className={cx('chat')}>
      <div className={cx('chat-list')}>
        <FormControlLabel
          className={cx('chat-filters')}
          label="Currently open"
          reverse
        >
          <Switch checked={onlyEnabled} onChange={setOnlyEnabled} />
        </FormControlLabel>
        {list.map(
          (w) =>
            w.type === 'twitch' && (
              <NavLink
                className={({ isActive }) =>
                  cx('chat-item', { active: isActive })
                }
                key={w.id}
                to={`/chat/${w.channel}`}
              >
                {w.channel}
              </NavLink>
            ),
        )}
      </div>
      <div className={cx('chat-content')}>
        <Outlet />
      </div>
    </div>
  );
}

export default Chat;
