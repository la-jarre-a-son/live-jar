import React from 'react';
import classnames from 'classnames/bind';
import { Outlet } from 'react-router-dom';

import { Icon, SidebarContainer, TabList, Toolbar } from '@la-jarre-a-son/ui';
import { NavTab } from 'renderer/components';

import styles from './SettingsLayout.module.scss';

const cx = classnames.bind(styles);

type Props = {
  className?: string;
};

/**
 *  Settings page
 *
 * @version 1.0.0
 * @author Rémi Jarasson
 */
const Settings: React.FC<Props> = ({ className }) => (
  <SidebarContainer
    className={cx('base', className)}
    sidebar={
      <>
        <TabList
          className={cx('navigation')}
          aria-label="Settings Navigation"
          direction="vertical"
          variant="ghost"
        >
          <NavTab
            to="/settings/general"
            title="General"
            left={<Icon name="fi fi-rr-browser" />}
          >
            <span className={cx('label')}>General</span>
          </NavTab>
          <NavTab
            to="/settings/playlists"
            title="Playlists"
            left={<Icon name="fi fi-rr-star" />}
          >
            <span className={cx('label')}>Playlists</span>
          </NavTab>
          <NavTab
            to="/settings/licenses"
            title="Licenses"
            left={<Icon name="fi fi-rr-copyright" />}
          >
            <span className={cx('label')}>Licenses</span>
          </NavTab>
          <NavTab
            to="/settings/about"
            title="About"
            left={<Icon name="fi fi-rr-info" />}
          >
            <span className={cx('label')}>About</span>
          </NavTab>
        </TabList>
        <Toolbar className={cx('footer')} elevation={2} placement="bottom">
          v{process.env.APP_VERSION}
        </Toolbar>
      </>
    }
    size="md"
    sidebarProps={{ className: cx('sidebar') }}
    contentProps={{ className: cx('content') }}
    open
    inset
  >
    <Outlet />
  </SidebarContainer>
);

export default Settings;
