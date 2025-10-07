import React from 'react';
import classnames from 'classnames/bind';
import { Outlet } from 'react-router-dom';

import {
  Button,
  Modal,
  ModalActions,
  ModalContainer,
  ModalContent,
  ModalHeader,
} from '@la-jarre-a-son/ui';

import { useSettings } from 'renderer/contexts/Settings';

import About from '../Settings/About';

import TopBar from './TopBar';

import styles from './Layout.module.scss';

const cx = classnames.bind(styles);

const Layout: React.FC = () => {
  const { settings, updateInfo, dismissChangelog, dismissUpdate } =
    useSettings();

  const closeAboutModalOpen = () => {
    dismissChangelog();
  };

  const closeUpdateModalOpen = () => {
    dismissUpdate(updateInfo?.version || '');
  };
  return (
    <div className={cx('base')}>
      <TopBar />
      <div className={cx('modalContainer')}>
        <ModalContainer>
          <div className={cx('content')}>
            <Outlet />
          </div>
          <Modal
            onClose={closeAboutModalOpen}
            open={!settings?.appState.changelogDismissed}
            size="lg"
          >
            <ModalHeader title="Live Jar" />
            <ModalContent>
              <About />
            </ModalContent>
          </Modal>
          {!!updateInfo && (
            <Modal
              onClose={closeUpdateModalOpen}
              open={!settings?.appState.updateDismissed}
              size="sm"
            >
              <ModalHeader title="Update available" />
              <ModalContent>
                A new version of Live Jar (v{updateInfo.version}) is available.
                Since this app is not signed, auto-update cannot install it
                automatically.
              </ModalContent>
              <ModalActions>
                <Button
                  block
                  as="a"
                  intent="primary"
                  href={`https://github.com/la-jarre-a-son/live-jar/releases/tag/v${updateInfo.version}`}
                  target="_blank"
                >
                  Go to release page
                </Button>
              </ModalActions>
            </Modal>
          )}
        </ModalContainer>
      </div>
    </div>
  );
};

export default Layout;
