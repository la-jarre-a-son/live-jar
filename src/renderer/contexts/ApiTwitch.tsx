import React, {
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';

import { StaticAuthProvider } from '@twurple/auth';
import {
  ApiClient,
  HelixPrivilegedUser,
  HelixStream,
  HelixUser,
} from '@twurple/api';
import { useSettings } from './Settings';

const CLIENT_ID = '047jczcyedth9awq0kcnv6m04175iy';

export type MappedChannels = Record<
  string,
  { user?: HelixUser; stream?: HelixStream | null }
>;

interface ApiTwitchContextInterface {
  getChannels: (channels: string[]) => Promise<HelixUser[]>;
  getChannelStreams: (channels: string[]) => Promise<HelixStream[]>;
  getAuthenticatedUser: () => Promise<HelixPrivilegedUser | null>;
  channels: MappedChannels;
  lastRefresh: number;
}

const ApiTwitchContext = React.createContext<ApiTwitchContextInterface | null>(
  null,
);

type Props = {
  children: React.ReactNode;
};

const ApiTwitchProvider: React.FC<Props> = ({ children }) => {
  const { settings } = useSettings();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [channels, setChannels] = useState<MappedChannels>({});
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // local cache for refreshing channels streams without object reference changing issues
  const channelIdsList = useMemo(
    () => Object.keys(channels).join(','),
    [channels],
  );

  const getChannels = useCallback(
    async (ids: string[]) => {
      if (apiClient) {
        const users = await apiClient.users.getUsersByNames(ids);
        setChannels((mapped) =>
          users.reduce(
            (acc, u) => {
              acc[u.name] = acc[u.name] ? { ...acc[u.name] } : {};
              acc[u.name].user = u;
              return acc;
            },
            { ...mapped },
          ),
        );

        return users;
      }
      return [];
    },
    [apiClient],
  );

  const getChannelStreams = useCallback(
    async (ids: string[]) => {
      if (apiClient) {
        const streams = await apiClient.streams.getStreamsByUserNames(ids);
        setChannels((mapped) => {
          const mappedNew = ids.reduce(
            (acc, s) => {
              if (acc[s]) {
                acc[s].stream = null;
              }
              return acc;
            },
            { ...mapped },
          );

          return streams.reduce((acc, s) => {
            acc[s.userName] = acc[s.userName] ?? {};
            acc[s.userName].stream = s;
            return acc;
          }, mappedNew);
        });

        return streams;
      }
      return [];
    },
    [apiClient],
  );

  const getAuthenticatedUser = useCallback(async () => {
    if (apiClient) {
      const { userId } = await apiClient.getTokenInfo();
      if (userId) {
        const user = await apiClient.users.getAuthenticatedUser(userId);

        return user;
      }
    }
    return null;
  }, [apiClient]);

  const refreshFollowedChannels = useCallback(async () => {
    if (apiClient) {
      const { userId } = await apiClient.getTokenInfo();
      if (userId) {
        const followed = await apiClient?.channels
          .getFollowedChannelsPaginated(userId)
          .getAll();

        const c = followed.map((f) => f.broadcasterName);

        c.sort();

        window.app.playlists.update('followed', 'twitch', c);
      }
    }
    return null;
  }, [apiClient]);

  useEffect(() => {
    async function refreshChannels() {
      if (settings.windows) {
        const windowedChannels = settings.windows
          .map((w) => w.type === 'twitch' && w.channel)
          .filter((u) => typeof u === 'string');

        const favoriteChannels = settings.playlists
          .map((w) => w.type === 'twitch' && w.entries)
          .reduce(
            (acc: string[], entries) =>
              acc && entries ? acc.concat(entries) : acc,
            [],
          );

        const userNames = [
          ...new Set(windowedChannels.concat(favoriteChannels)),
        ];

        for (let i = 0; i < userNames.length; i += 100) {
          const ids = userNames.slice(i, i + 100);

          // eslint-disable-next-line no-await-in-loop
          await getChannels(ids);
        }
      }
    }

    refreshChannels();
  }, [getChannels, settings.windows, settings.playlists]);

  useEffect(() => {
    async function refreshChannelsStreams() {
      if (!channelIdsList) return;

      const channelsIds = channelIdsList.split(',');

      for (let i = 0; i < channelsIds.length; i += 100) {
        const ids = channelsIds.slice(i, i + 100);

        // eslint-disable-next-line no-await-in-loop
        await getChannelStreams(ids);
      }

      setLastRefresh(Date.now());
    }

    const interval = setInterval(refreshChannelsStreams, 60 * 1000);

    refreshChannelsStreams();
    return () => {
      clearInterval(interval);
    };
  }, [getChannelStreams, channelIdsList]);

  useEffect(() => {
    if (apiClient) {
      refreshFollowedChannels();
    }
  }, [apiClient, refreshFollowedChannels]);

  useEffect(() => {
    if (settings.auth.twitch) {
      const authProvider = new StaticAuthProvider(
        CLIENT_ID,
        settings.auth.twitch.accessToken,
        settings.auth.twitch.scopes,
      );
      setApiClient(new ApiClient({ authProvider }));
    } else {
      setApiClient(null);
    }
  }, [settings.auth.twitch]);

  const value = useMemo(
    () => ({
      getChannels,
      getChannelStreams,
      getAuthenticatedUser,
      channels,
      lastRefresh,
    }),
    [
      getChannels,
      getChannelStreams,
      getAuthenticatedUser,
      channels,
      lastRefresh,
    ],
  );

  return (
    <ApiTwitchContext.Provider value={value}>
      {children}
    </ApiTwitchContext.Provider>
  );
};

export const useApiTwitch = () => {
  const context = useContext(ApiTwitchContext);
  if (!context) {
    throw new Error(`useApiTwitch must be used within a ApiTwitch`);
  }
  return context;
};

export default ApiTwitchProvider;
