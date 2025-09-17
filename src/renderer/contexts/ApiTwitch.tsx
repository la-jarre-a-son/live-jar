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
  { user: HelixUser; stream?: HelixStream }
>;

interface ApiTwitchContextInterface {
  getChannels: (channels: string[]) => Promise<MappedChannels>;
  getAuthenticatedUser: () => Promise<HelixPrivilegedUser | null>;
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

  const getChannels = useCallback(
    async (channels: string[]) => {
      if (apiClient) {
        const users = await apiClient.users.getUsersByNames(channels);
        const streams = await apiClient.streams.getStreamsByUserNames(channels);

        const mapped: MappedChannels = {};

        users.reduce((acc, u) => {
          acc[u.name] = { user: u };
          return acc;
        }, mapped);

        streams.reduce((acc, s) => {
          acc[s.userName].stream = s;
          return acc;
        }, mapped);

        return mapped;
      }
      return {};
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

        const channels = followed.map((f) => f.broadcasterName);

        channels.sort();

        window.app.playlists.update('followed', 'twitch', channels);
      }
    }
    return null;
  }, [apiClient]);

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
      getAuthenticatedUser,
    }),
    [getChannels, getAuthenticatedUser],
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
