import React, { useState, useContext, useMemo } from 'react';
import { useSettings } from './Settings';

interface StreamStatsContextInterface {
  latencyHighThreshold: number;
  latency: number | null;
  fps: number | null;

  setLatency: (latency: number | null) => void;
  setFps: (fps: number | null) => void;
}

const StreamStatsContext =
  React.createContext<StreamStatsContextInterface | null>(null);

type Props = {
  children: React.ReactNode;
};

const StreamStatsProvider: React.FC<Props> = ({ children }) => {
  const { settings } = useSettings();
  const { latencyHighThreshold } = settings.general;
  const [latency, setLatency] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      latencyHighThreshold,
      latency,
      fps,
      setLatency,
      setFps,
    }),
    [latencyHighThreshold, latency, fps, setLatency, setFps],
  );

  return (
    <StreamStatsContext.Provider value={value}>
      {children}
    </StreamStatsContext.Provider>
  );
};

export const useStreamStats = () => {
  const context = useContext(StreamStatsContext);
  if (!context) {
    throw new Error(`useStreamStats must be used within a StreamStatsProvider`);
  }
  return context;
};

export default StreamStatsProvider;
