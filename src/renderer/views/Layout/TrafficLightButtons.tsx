import React from 'react';

import { Button, ButtonGroup, Icon } from '@la-jarre-a-son/ui';

import { useWindowState } from 'renderer/contexts/WindowState';

type Props = {
  className?: string;
};

const TrafficLightButtons: React.FC<Props> = ({ className }) => {
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
        aria-label="Close"
        onClick={() => close(null)}
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
