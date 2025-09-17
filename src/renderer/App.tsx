import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@la-jarre-a-son/ui';

import ApiTwitchProvider from 'renderer/contexts/ApiTwitch';

import router from './router';

import WindowStateProvider from './contexts/WindowState';
import SettingsProvider from './contexts/Settings';

import './App.scss';

export default function App() {
  return (
    <ThemeProvider theme="jar" variant="dark">
      <WindowStateProvider>
        <SettingsProvider>
          <ApiTwitchProvider>
            <RouterProvider router={router} />
          </ApiTwitchProvider>
        </SettingsProvider>
      </WindowStateProvider>
    </ThemeProvider>
  );
}
