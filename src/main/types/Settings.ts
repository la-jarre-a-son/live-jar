export type WindowState = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized: boolean;
  alwaysOnTop: boolean;
};

export type StreamWindowState = WindowState & {
  enabled: boolean;
  muted: boolean;
  locked: boolean;
  ignoreSolo: boolean;
};

export type BaseStreamWindow = {
  id: number;
  label: string;
  state: StreamWindowState | null;
  url?: string;
  quality: string;
  volume: number;
};

export type TwitchStreamWindow = BaseStreamWindow & {
  type: 'twitch';
  channel: string;
};

export type IframeStreamWindow = BaseStreamWindow & {
  type: 'iframe';
  url: string;
};

export type StreamWindow = TwitchStreamWindow | IframeStreamWindow;

export type ChannelPlaylistType = 'twitch' | 'iframe';

export type ChannelPlaylist = {
  label: string;
  type: ChannelPlaylistType;
  entries: string[];
};

export type GeneralSettings = {
  reopenWindows: boolean;
  topbarStyle: 'solid' | 'transparent' | 'hidden';
  volumeScrollSpeed: number;
  latencyHighThreshold: number;
  mutePrerollTimeout: number;
  autoRefreshHighLatency: boolean;
  doubleClickAction: 'none' | 'maximize' | 'solo' | 'mute';
};

export type AuthToken = {
  accessToken: string;
  type: 'bearer';
  scopes: string[];
};

export type AuthSettings = {
  twitch: AuthToken | null;
};

export type AuthProvider = keyof AuthSettings;

export type AppState = {
  changelogDismissed: string | null;
  updateDismissed: string | null;
};

export type Settings = {
  auth: AuthSettings;
  general: GeneralSettings;
  windows: StreamWindow[];
  playlists: ChannelPlaylist[];
  windowState: WindowState;
  appState: AppState;
};
