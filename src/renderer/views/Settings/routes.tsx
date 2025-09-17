import { Route, Navigate } from 'react-router-dom';

import { Icon } from 'renderer/components';

import SettingsLayout from './Layout';

import GeneralSettings from './GeneralSettings';
import Playlists from './Playlists';
import About from './About';
import Licenses from './Licenses';

const settingsRoutes = () => (
  <Route
    path="settings"
    handle={{ title: 'Settings', icon: <Icon name="settings" /> }}
    element={<SettingsLayout />}
  >
    <Route index element={<Navigate to="general" replace />} />
    <Route path="general" element={<GeneralSettings />} />
    <Route path="playlists" element={<Playlists />} />
    <Route path="licenses" element={<Licenses />} />
    <Route path="about" element={<About />} />
  </Route>
);

export default settingsRoutes;
