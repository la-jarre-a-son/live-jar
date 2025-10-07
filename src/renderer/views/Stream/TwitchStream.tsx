import React, { useCallback, useEffect, useRef } from 'react';
import classnames from 'classnames/bind';

import { TwitchStreamWindow } from 'main/types';
import { Twitch } from 'types/Twitch';

import { useStreamStats } from 'renderer/contexts/StreamStats';

import { useEvent } from '@la-jarre-a-son/ui';
import styles from './Stream.module.scss';

const LATENCY_SAMPLES = 5;

const cx = classnames.bind(styles);

type Props = {
  streamWindow: TwitchStreamWindow;
  volumeScrollSpeed: number;
  mutePrerollTimeout: number;
  autoRefreshHighLatency?: boolean;
  onStreamUpdate: (streamWindow: Partial<TwitchStreamWindow>) => void;
  onActive: () => void;
  onDoubleClick: () => void;
};

const TwitchStream: React.FC<Props> = ({
  streamWindow,
  volumeScrollSpeed,
  mutePrerollTimeout,
  autoRefreshHighLatency = false,
  onStreamUpdate,
  onActive,
  onDoubleClick,
}) => {
  const { latencyHighThreshold, setLatency, setFps } = useStreamStats();
  const lastLatencies = useRef<number[]>([]);
  const embed = useRef<Twitch.Embed>(null);

  const handleDoubleClick = useEvent(
    (event: { targetId: string; targetClassName: string }) => {
      // Avoids trigger double click on controls.
      if (event.targetClassName.includes('click-handler')) {
        onDoubleClick();
      }
    },
  );
  const handleScroll = useEvent((event: { deltaX: number; deltaY: number }) => {
    if (volumeScrollSpeed && embed.current) {
      const player = embed.current.getPlayer();
      if (event.deltaY > 10) {
        const newVolume = Math.max(player.getVolume() - volumeScrollSpeed, 0);
        player.setVolume(newVolume);
      } else if (event.deltaY < -10) {
        const newVolume = Math.min(player.getVolume() + volumeScrollSpeed, 1.0);
        player.setVolume(newVolume);
      }
    }
  });

  const handleIframeMessage = useEvent((event: MessageEvent) => {
    if (
      event.origin === 'https://embed.twitch.tv' &&
      typeof event.data === 'object' &&
      event.data?.namespace === 'live-jar' &&
      typeof event.data?.eventName === 'string'
    ) {
      if (event.data?.eventName === 'wheel') {
        handleScroll(event.data.params);
      }
      if (event.data?.eventName === 'dblclick') {
        handleDoubleClick(event.data.params);
      }
      if (event.data?.eventName === 'mousemove') {
        onActive();
      }
    }
  });

  const initPlayer = useCallback(
    (embedElement: HTMLDivElement) => {
      if (!embed.current) {
        embed.current = new window.Twitch.Embed(embedElement.id, {
          width: '100%',
          height: '100%',
          layout: 'video',
          muted: true,
          autoplay: false,
          theme: 'dark',
          channel: streamWindow.channel,
          allowfullscreen: false,
          parent: ['localhost'],
        });

        const t = setTimeout(() => {
          document.body.classList.add(cx('error'));
        }, 5000);

        // @ts-ignore
        embed.current.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
          clearTimeout(t);
          document.body.classList.add(cx('ready'));
          if (embed.current) {
            const player = embed.current.getPlayer();
            player.setQuality(streamWindow.quality);
            player.setVolume(streamWindow.volume);
            player.play();

            if (mutePrerollTimeout) {
              setTimeout(() => {
                player.setMuted(false);
              }, mutePrerollTimeout * 1000);
            } else {
              player.setMuted(false);
            }
          }
        });

        // @ts-ignore
        embed.current.addEventListener(window.Twitch.Embed.ONLINE, () => {
          setTimeout(() => {
            document.body.classList.add(cx('ready'));
            if (embed.current) {
              const player = embed.current.getPlayer();
              player.setQuality(streamWindow.quality);
              player.setVolume(streamWindow.volume);
              player.play();
            }
          }, 5000);
        });
      }
    },
    [streamWindow, mutePrerollTimeout],
  );

  useEffect(() => {
    if (embed.current) {
      document.body.classList.remove(cx('error'));
      const player = embed.current.getPlayer();

      if (player.getQuality() !== streamWindow.quality) {
        player.setQuality(streamWindow.quality);
      }
      if (player.getChannel() !== streamWindow.channel) {
        player.setChannel(streamWindow.channel);
      }
      if (player.getVolume() !== streamWindow.volume) {
        player.setVolume(streamWindow.volume);
      }
    }

    const interval = setInterval(() => {
      if (embed.current) {
        const player = embed.current.getPlayer();
        const stats = player.getPlaybackStats();

        setLatency(stats.hlsLatencyBroadcaster);
        setFps(stats.fps);

        const currentQuality = player.getQuality();
        const currentVolume = player.getVolume();
        if (
          !player.isPaused() &&
          (streamWindow.quality !== currentQuality ||
            streamWindow.volume !== currentVolume)
        ) {
          onStreamUpdate({
            quality: currentQuality,
            volume: currentVolume,
          });
        }

        if (!player.isPaused() && autoRefreshHighLatency) {
          // Check latency is not over threshold
          lastLatencies.current.push(stats.hlsLatencyBroadcaster);
          if (lastLatencies.current.length > LATENCY_SAMPLES) {
            lastLatencies.current.splice(
              0,
              lastLatencies.current.length - LATENCY_SAMPLES,
            );
          }
          if (lastLatencies.current.length === LATENCY_SAMPLES) {
            const averageLatency =
              lastLatencies.current.reduce((avg, l) => avg + l, 0) /
              LATENCY_SAMPLES;
            if (averageLatency > latencyHighThreshold) {
              lastLatencies.current = [];
              // eslint-disable-next-line no-console
              console.warn(
                `latency is higher than ${
                  latencyHighThreshold
                }s - trying to refresh`,
              );
              document.body.classList.remove(cx('ready'));
              setTimeout(() => {
                player.pause();
                player.play();
              }, 1000);
              setTimeout(() => {
                document.body.classList.add(cx('ready'));
              }, 5000);
            }
          }
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [
    latencyHighThreshold,
    autoRefreshHighLatency,
    streamWindow,
    onStreamUpdate,
    setLatency,
    setFps,
  ]);

  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);

    return () => window.removeEventListener('message', handleIframeMessage);
  }, [handleIframeMessage]);

  return <div ref={initPlayer} id="twitchEmbed" />;
};

export default TwitchStream;
