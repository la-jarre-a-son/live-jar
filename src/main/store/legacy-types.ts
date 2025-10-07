/* v1.0.0 */

export type v1_0_0_WindowState = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized: boolean;
  alwaysOnTop: boolean;
};

export type v1_0_0_StreamWindowState = v1_0_0_WindowState & {
  enabled: boolean;
  muted: boolean;
  locked: boolean;
  ignoreSolo: boolean;
};

export type v1_0_0_BaseStreamWindow = {
  id: number;
  label: string;
  state: v1_0_0_StreamWindowState | null;
  url?: string;
  quality: string;
  volume: number;
};

export type v1_0_0_TwitchStreamWindow = v1_0_0_BaseStreamWindow & {
  type: 'twitch';
  channel: string;
};

export type v1_0_0_IframeStreamWindow = v1_0_0_BaseStreamWindow & {
  type: 'iframe';
  url: string;
};

export type v1_0_0_StreamWindow =
  | v1_0_0_TwitchStreamWindow
  | v1_0_0_IframeStreamWindow;

export type v1_0_0_ChannelPlaylistType = 'twitch' | 'iframe';

export type v1_0_0_ChannelPlaylist = {
  label: string;
  type: v1_0_0_ChannelPlaylistType;
  entries: string[];
};

export type v1_0_0_GeneralSettings = {
  reopenWindows: boolean;
  topbarStyle: 'solid' | 'transparent' | 'hidden';
  volumeScrollSpeed: number;
  latencyHighThreshold: number;
  mutePrerollTimeout: number;
  autoRefreshHighLatency: boolean;
  doubleClickAction: 'none' | 'maximize' | 'solo' | 'mute';
};

export type v1_0_0_AuthToken = {
  accessToken: string;
  type: 'bearer';
  scopes: string[];
};

export type v1_0_0_AuthSettings = {
  twitch: v1_0_0_AuthToken | null;
};

export type v1_0_0_AuthProvider = keyof v1_0_0_AuthSettings;

export type v1_0_0_Settings = {
  auth: v1_0_0_AuthSettings;
  general: v1_0_0_GeneralSettings;
  windows: v1_0_0_StreamWindow[];
  playlists: v1_0_0_ChannelPlaylist[];
  windowState: v1_0_0_WindowState;
};

/* v1.0.1 */

export type v1_0_1_AppState = {
  changelogDismissed: string | null;
  updateDismissed: string | null;
};

export type v1_0_1_Settings = v1_0_0_Settings & {
  appState: v1_0_1_AppState;
};
