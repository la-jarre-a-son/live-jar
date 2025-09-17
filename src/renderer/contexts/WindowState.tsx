import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { StreamWindowState } from 'main/types';
import { defaults } from 'main/store/defaults';

interface WindowStateContextInterface {
  windowId: number | null;
  windowState: StreamWindowState;
  setState: (id: number | null, state: Partial<StreamWindowState>) => void;
  close: (id: number | null) => void;
  toggleMaximize: () => void;
  maximize: () => void;
  unmaximize: () => void;
  minimize: () => void;
  titleBarDoubleClick: () => void;
}

const WindowStateContext =
  React.createContext<WindowStateContextInterface | null>(null);

type Props = {
  children: React.ReactNode;
};

const numberOrNull = (str: string | null) => {
  if (!str) return null;
  const n = parseInt(str, 10);
  return Number.isNaN(n) ? null : n;
};

const WindowStateProvider: React.FC<Props> = ({ children }) => {
  const params = new URLSearchParams(window.location.search);
  const windowId = numberOrNull(params.get('id'));

  const [windowState, setWindowState] = useState<StreamWindowState>(
    defaults.settings.windowState as StreamWindowState,
  );

  const onStateChange = useCallback((state: StreamWindowState) => {
    setWindowState(state);
  }, []);

  const close = useCallback(
    (id: number | null) => window.app.window.close(id),
    [],
  );
  const toggleMaximize = useCallback(
    () =>
      windowState.maximized
        ? window.app.window.unmaximize()
        : window.app.window.maximize(),
    [windowState.maximized],
  );
  const maximize = useCallback(() => window.app.window.maximize(), []);
  const unmaximize = useCallback(() => window.app.window.unmaximize(), []);
  const minimize = useCallback(() => window.app.window.minimize(), []);
  const setState = useCallback(
    (id: number | null, state: Partial<StreamWindowState>) =>
      window.app.window.setState(id, state),
    [],
  );
  const titleBarDoubleClick = useCallback(
    () => window.app.window.titleBarDoubleClick(),
    [],
  );

  useEffect(() => {
    const offStateChange = window.app.window.onStateChange(onStateChange);

    window.app.window.getState(windowId);

    return () => {
      offStateChange();
    };
  }, [onStateChange, windowId]);

  const value = useMemo(
    () => ({
      windowId,
      windowState,
      toggleMaximize,
      maximize,
      unmaximize,
      minimize,
      close,
      titleBarDoubleClick,
      setState,
    }),
    [
      windowId,
      windowState,
      toggleMaximize,
      maximize,
      minimize,
      unmaximize,
      close,
      titleBarDoubleClick,
      setState,
    ],
  );

  return (
    <WindowStateContext.Provider value={value}>
      {children}
    </WindowStateContext.Provider>
  );
};

export const useWindowState = () => {
  const context = useContext(WindowStateContext);
  if (!context) {
    throw new Error(`useWindowState must be used within a WindowStateProvider`);
  }
  return context;
};

export default WindowStateProvider;
