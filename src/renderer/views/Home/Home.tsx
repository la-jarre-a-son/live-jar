import classnames from 'classnames/bind';
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
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
  Container,
  Icon,
  Grid,
  Stack,
} from '@la-jarre-a-son/ui';

import { NavButton } from 'renderer/components';

import { MappedChannels, useApiTwitch } from 'renderer/contexts/ApiTwitch';
import { useSettings } from 'renderer/contexts/Settings';

import StreamMenu from './StreamMenu';

import styles from './Home.module.scss';

const cx = classnames.bind(styles);

export function Home() {
  const { settings } = useSettings();
  const [channels, setChannels] = useState<MappedChannels>({});
  const { getChannels } = useApiTwitch();

  const openStream = (id: number) => {
    window.app.window.open(id);
  };

  useEffect(() => {
    function refreshChannels() {
      if (settings.windows) {
        const userNames = settings.windows
          .map((w) => w.type === 'twitch' && w.channel)
          .filter((u) => typeof u === 'string');

        getChannels(userNames)
          .then((c) => {
            setChannels(c);
            return true;
          })
          .catch(() => {
            return false;
          });
      }
    }

    const interval = setInterval(refreshChannels, 60 * 1000);
    refreshChannels();
    return () => {
      clearInterval(interval);
    };
  }, [getChannels, settings.windows]);

  return (
    <div className={cx('base')}>
      <Container size="xl" className={cx('container')}>
        <Grid size="md" gap="lg">
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
                        ? `${channels[w.channel].stream?.getThumbnailUrl(640, 360)}?${Date.now()}`
                        : channels[w.channel].user.offlinePlaceholderUrl
                      : undefined
                  }
                >
                  <CardThumbnailOverlay
                    as="button"
                    onClick={() => openStream(w.id)}
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
                              ? channels[w.channel].user.profilePictureUrl
                              : ''
                          }
                          alt={`Profile Picture of ${
                            w.channel && channels[w.channel]
                              ? channels[w.channel].user.displayName
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
                        ? channels[w.channel].user.displayName
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
                  {w.channel && channels[w.channel] ? (
                    <CardThumbnailItem
                      className={cx('streamStatus')}
                      position="bottom-left"
                    >
                      {channels[w.channel].stream ? (
                        <Marquee speed={30} autoFill>
                          <Stack gap="sm" className={cx('streamTitle')}>
                            <Badge intent="error" size="sm">
                              LIVE
                            </Badge>
                            <span>{channels[w.channel].stream?.title}</span>
                          </Stack>
                        </Marquee>
                      ) : (
                        'Stream Offline'
                      )}
                    </CardThumbnailItem>
                  ) : null}
                </CardThumbnail>
              )}

              <CardHeader
                right={
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
      </Container>
      <Outlet />
    </div>
  );
}

export default Home;
