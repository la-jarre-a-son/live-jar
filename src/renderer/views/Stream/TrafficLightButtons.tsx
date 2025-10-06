import React from 'react';

import { Button, ButtonGroup, Icon } from '@la-jarre-a-son/ui';

import { useWindowState } from 'renderer/contexts/WindowState';

type Props = {
  className?: string;
  windowId: number;
};

const TrafficLightButtons: React.FC<Props> = ({
  className = null,
  windowId,
}) => {
  const { windowState, maximize, unmaximize, minimize, close } =
    useWindowState();

  const handleEvent =
    (callback: () => void) => (event: React.MouseEvent<unknown>) => {
      (event.currentTarget as HTMLButtonElement)?.blur();
      callback();
    };

  return (
    <ButtonGroup className={className}>
      <Button
        size="sm"
        aria-label="Minimize"
        onClick={handleEvent(minimize)}
        intent="warning"
        hoverIntent
        icon
      >
        <Icon name="fi fi-rr-window-minimize" />
      </Button>
      {windowState.maximized ? (
        <Button
          size="sm"
          aria-label="Unmaximize"
          onClick={handleEvent(unmaximize)}
          intent="success"
          hoverIntent
          icon
        >
          <Icon name="fi fi-rr-down-left-and-up-right-to-center" />
        </Button>
      ) : (
        <Button
          size="sm"
          aria-label="Maximize"
          onClick={handleEvent(maximize)}
          intent="success"
          hoverIntent
          icon
        >
          <Icon name="fi fi-rr-arrow-up-right-and-arrow-down-left-from-center" />
        </Button>
      )}
      <Button
        size="sm"
        aria-label="Close"
        onClick={() => close(windowId)}
        intent="danger"
        hoverIntent
        icon
      >
        <Icon name="fi fi-rr-cross" />
      </Button>
    </ButtonGroup>
  );
};

export default TrafficLightButtons;
