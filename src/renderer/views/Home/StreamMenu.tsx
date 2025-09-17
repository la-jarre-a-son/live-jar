import React, { useMemo } from 'react';
import classnames from 'classnames/bind';
import {
  Divider,
  Menu,
  MenuItem,
  MenuItemCheckbox,
  SubMenu,
  TreeView,
  TreeViewItem,
} from '@la-jarre-a-son/ui';

import { StreamWindow } from 'main/types';
import { NavLink } from 'react-router-dom';

import { useSettings } from 'renderer/contexts/Settings';
import styles from './Home.module.scss';

const cx = classnames.bind(styles);

type Props = {
  trigger: React.ReactNode;
  windowSettings: StreamWindow;
};

const StreamMenu: React.FC<Props> = ({ trigger, windowSettings }) => {
  const { settings } = useSettings();

  const switchChannels = useMemo(() => {
    return settings.windows
      .filter((w) => w.id !== windowSettings.id && w.state?.enabled)
      .map((w) => ({ id: w.id, label: w.label }));
  }, [settings.windows, windowSettings.id]);

  const openStream = () => {
    window.app.window.open(windowSettings.id);
  };

  const closeStream = () => {
    window.app.window.close(windowSettings.id);
  };

  const deleteStream = () => {
    window.app.stream.delete(windowSettings.id);
  };

  const switchWith = (targetId: number) => {
    window.app.stream.switch(windowSettings.id, targetId);
  };

  const setChannel = (channel: string) => {
    window.app.stream.update(windowSettings.id, { channel });
  };

  const solo = () => {
    window.app.window.solo(windowSettings.id);
  };

  const toggleIgnoreSolo = () => {
    window.app.window.setState(windowSettings.id, {
      ignoreSolo: !windowSettings.state?.ignoreSolo,
    });
  };

  const toggleMuted = () => {
    window.app.window.setState(windowSettings.id, {
      muted: !windowSettings.state?.muted,
    });
  };

  const toggleAlwaysOnTop = () => {
    window.app.window.setState(windowSettings.id, {
      alwaysOnTop: !windowSettings.state?.alwaysOnTop,
    });
  };

  const toggleLocked = () => {
    window.app.window.setState(windowSettings.id, {
      locked: !windowSettings.state?.locked,
    });
  };

  return (
    <Menu trigger={trigger}>
      <MenuItem onClick={openStream}>
        {windowSettings.state?.enabled ? 'Focus Window' : 'Open Window'}
      </MenuItem>
      {windowSettings.state?.enabled ? (
        <MenuItem onClick={closeStream}>Close Window</MenuItem>
      ) : null}
      <Divider />
      {windowSettings.state?.enabled && switchChannels.length > 0 ? (
        <SubMenu text="Switch With">
          {switchChannels.map((w) => (
            <MenuItem onClick={() => switchWith(w.id)}>{w.label}</MenuItem>
          ))}
        </SubMenu>
      ) : null}
      <SubMenu
        text="Set Channel"
        dropdownProps={{ placement: 'left' }}
        className={cx('playlistsMenu')}
      >
        <TreeView aria-label="playlists" className={cx('playlists')}>
          {settings.playlists.map((p) =>
            p.type === 'twitch' ? (
              <TreeViewItem title={p.label}>
                {p.entries.map((e) => (
                  <TreeViewItem
                    as={MenuItem}
                    title={e}
                    onClick={() => setChannel(e)}
                  />
                ))}
              </TreeViewItem>
            ) : null,
          )}
        </TreeView>
      </SubMenu>
      <Divider />
      <MenuItem onClick={solo}>Solo Audio</MenuItem>
      <MenuItemCheckbox
        checked={windowSettings.state?.ignoreSolo}
        onClick={toggleIgnoreSolo}
        variant="switch"
      >
        Ignore Solo
      </MenuItemCheckbox>
      <MenuItemCheckbox
        checked={windowSettings.state?.muted}
        onClick={toggleMuted}
        variant="switch"
      >
        Mute
      </MenuItemCheckbox>
      <MenuItemCheckbox
        checked={windowSettings.state?.alwaysOnTop}
        onClick={toggleAlwaysOnTop}
        variant="switch"
      >
        Always on Top
      </MenuItemCheckbox>
      <MenuItemCheckbox
        checked={windowSettings.state?.locked}
        onClick={toggleLocked}
        variant="switch"
      >
        Lock
      </MenuItemCheckbox>
      <Divider />
      <MenuItem as={NavLink} to={`/window/${windowSettings.id}`}>
        Edit Window
      </MenuItem>
      <MenuItem className={cx('menuItemDelete')} onClick={deleteStream}>
        Delete Window
      </MenuItem>
      <Divider />
    </Menu>
  );
};

export default StreamMenu;
