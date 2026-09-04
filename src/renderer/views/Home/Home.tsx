import classnames from 'classnames/bind';
import { useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardThumbnail,
  CardThumbnailOverlay,
  CardThumbnailItem,
  CardHeader,
  Icon,
  Grid,
  ButtonGroup,
} from '@la-jarre-a-son/ui';

import { NavButton } from 'renderer/components';

import { useApiTwitch } from 'renderer/contexts/ApiTwitch';
import { useSettings } from 'renderer/contexts/Settings';

import { StreamWindow } from 'main/types';
import StreamMenu from './StreamMenu';

import styles from './Home.module.scss';

const cx = classnames.bind(styles);

export function Home() {
  const { settings } = useSettings();
  const { channels, lastRefresh } = useApiTwitch();
  const handleClick = useCallback(
    (w: StreamWindow) => {
      const action = settings.general.homeOpenAction;

      if (w.state?.enabled) {
        if (action === 'open') {
          window.app.window.open(w.id);
        }
        if (action === 'toggle') {
          window.app.window.close(w.id);
        }
        if (action === 'solo') {
          window.app.window.solo(w.id);
        }
        if (action === 'switchWithMain') {
          window.app.stream.switchWithMain(w.id);
        }
      } else {
        window.app.window.open(w.id);
      }
    },
    [settings.general.homeOpenAction],
  );

  return (
    <div className={cx('base')}>
      <div className={cx('container')}>
        <Grid size="lg" gap="lg">
          {settings.windows.map((w) => (
            <Card
              key={`${w.id}`}
              className={cx('window', { '--enabled': w.state?.enabled })}
              outlined
              elevation={w.state?.enabled ? 3 : 2}
            >
              {w.type === 'twitch' && (
                <CardThumbnail
                  className={cx('windowThumbnail')}
                  alt="Stream preview"
                  imgProps={{ className: cx('windowThumbnailImage') }}
                  src={
                    w.channel && channels[w.channel]
                      ? channels[w.channel].stream
                        ? `${channels[w.channel].stream?.getThumbnailUrl(640, 360)}?${lastRefresh}`
                        : channels[w.channel].user?.offlinePlaceholderUrl ||
                          undefined
                      : undefined
                  }
                >
                  <CardThumbnailOverlay
                    as="button"
                    onClick={() => handleClick(w)}
                    interactive
                  />
                  <CardThumbnailItem
                    className={cx('channelName')}
                    position="top-left"
                  >
                    <CardHeader
                      left={
                        <Avatar
                          size="sm"
                          image={
                            w.channel && channels[w.channel]
                              ? (channels[w.channel].user?.profilePictureUrl ??
                                '')
                              : ''
                          }
                          alt={`Profile Picture of ${
                            w.channel && channels[w.channel]
                              ? channels[w.channel].user?.displayName
                              : w.id
                          }`}
                          outlined
                          shape="round"
                          online={
                            !!w.channel &&
                            channels[w.channel] &&
                            !!channels[w.channel].stream
                          }
                        />
                      }
                    >
                      {w.channel && channels[w.channel]
                        ? channels[w.channel].user?.displayName
                        : w.channel}
                    </CardHeader>
                  </CardThumbnailItem>
                  <CardThumbnailItem position="top-right">
                    <NavButton
                      aria-label="chat"
                      icon
                      variant="ghost"
                      intent="neutral"
                      to={`/chat/${w.channel}`}
                    >
                      <Icon name="fi fi-rr-comments" />
                    </NavButton>
                  </CardThumbnailItem>
                  <CardThumbnailItem position="top-right">
                    <NavButton
                      aria-label="chat"
                      icon
                      variant="ghost"
                      intent="neutral"
                      to={`/chat/${w.channel}`}
                    >
                      <Icon name="fi fi-rr-comments" />
                    </NavButton>
                  </CardThumbnailItem>
                  {w.channel && channels[w.channel] ? (
                    <CardThumbnailItem
                      className={cx('streamStatus')}
                      position="bottom-left"
                    >
                      {channels[w.channel].stream ? (
                        <span>
                          <Badge intent="error" size="sm">
                            LIVE
                          </Badge>
                          &nbsp;
                          {channels[w.channel].stream?.title}
                        </span>
                      ) : (
                        'Stream Offline'
                      )}
                    </CardThumbnailItem>
                  ) : null}
                </CardThumbnail>
              )}

              <CardHeader
                right={
                  <ButtonGroup>
                    <Button
                      aria-label="solo"
                      icon
                      intent="success"
                      hoverIntent
                      onClick={() => window.app.window.solo(w.id)}
                    >
                      <Icon name="fi fi-rr-megaphone" />
                    </Button>
                    <Button
                      aria-label="switch with main"
                      icon
                      intent="warning"
                      hoverIntent
                      onClick={() => window.app.stream.switchWithMain(w.id)}
                    >
                      <Icon name="fi fi-rr-arrow-square-up" />
                    </Button>

                    <StreamMenu
                      trigger={
                        <Button
                          aria-label="more"
                          icon
                          variant="ghost"
                          intent="neutral"
                        >
                          <Icon name="fi fi-rr-menu-dots" />
                        </Button>
                      }
                      windowSettings={w}
                    />
                  </ButtonGroup>
                }
              >
                <span className={cx('windowLabel')}>{w.label}</span>
              </CardHeader>
            </Card>
          ))}
          <Card
            as={NavLink}
            outlined
            elevation={1}
            interactive
            to="/window/new"
          >
            <CardThumbnail alt="Stream preview">
              <Avatar size="xl">
                <Icon name="fi fi-rr-plus" />
              </Avatar>
            </CardThumbnail>
            <CardHeader>Add window</CardHeader>
          </Card>
        </Grid>
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
