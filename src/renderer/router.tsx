import {
  createHashRouter,
  createRoutesFromElements,
  Navigate,
  Params,
  Route,
} from 'react-router-dom';

import { Icon } from '@la-jarre-a-son/ui';

import packageJSON from '../../package.json';
import icon from '../../assets/icon.svg';

import settingsRoutes from './views/Settings';
import Layout from './views/Layout';
import Home from './views/Home';
import Chat, { ChatFrame } from './views/Chat';
import WindowModal from './views/WindowModal';

const router = createHashRouter(
  createRoutesFromElements(
    <Route
      path="/"
      handle={{
        title: packageJSON.build.productName,
        icon: <img src={icon} width={32} height={32} alt="" />,
      }}
      element={<Layout />}
    >
      <Route
        path="window"
        handle={{
          title: 'Windows',
          icon: <Icon name="fi fi-rr-window-restore" />,
        }}
        element={<Home />}
      >
        <Route
          path=":id"
          handle={{
            title: (params: Params) =>
              params.id === 'new' ? 'New window' : `Edit window ${params.id}`,
          }}
          element={<WindowModal />}
        />
      </Route>
      <Route
        path="chat"
        handle={{
          title: 'Chat',
          icon: <Icon name="fi fi-rr-comments" />,
        }}
        element={<Chat />}
      >
        <Route
          path=":channel"
          handle={{
            title: (params: Params) => params.channel,
          }}
          element={<ChatFrame />}
        />
      </Route>
      {settingsRoutes()}
      <Route index element={<Navigate to="/window" replace />} />
    </Route>,
  ),
);

export default router;
