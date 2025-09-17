import { ThemeProvider } from '@la-jarre-a-son/ui';

import WindowStateProvider from './contexts/WindowState';
import SettingsProvider from './contexts/Settings';

import './ChildWindow.scss';
import Stream from './views/Stream';
import StreamStatsProvider from './contexts/StreamStats';

export default function ChildWindow() {
  return (
    <ThemeProvider theme="jar" variant="dark">
      <WindowStateProvider>
        <SettingsProvider>
          <StreamStatsProvider>
            <Stream />
          </StreamStatsProvider>
        </SettingsProvider>
      </WindowStateProvider>
    </ThemeProvider>
  );
}
