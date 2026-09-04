export const fields = {
  homeOpenAction: {
    choices: [
      {
        value: 'open',
        label: 'Focus Window',
      },
      {
        value: 'toggle',
        label: 'Toggle Open/Close',
      },
      {
        value: 'solo',
        label: 'Solo',
      },
      {
        value: 'switchWithMain',
        label: 'Switch with Main',
      },
    ],
  },
  topbarStyle: {
    choices: [
      {
        value: 'solid',
        label: 'Solid',
      },
      {
        value: 'transparent',
        label: 'Transparent',
      },
      {
        value: 'hidden',
        label: 'Auto-hidden',
      },
    ],
  },
  doubleClickAction: {
    choices: [
      {
        value: 'none',
        label: 'Nothing',
      },
      {
        value: 'maximize',
        label: 'Toggle Maximize',
      },
      {
        value: 'mute',
        label: 'Toggle Mute',
      },
      {
        value: 'solo',
        label: 'Solo',
      },
      {
        value: 'reload',
        label: 'Reload',
      },
      {
        value: 'switchWithMain',
        label: 'Switch with Main',
      },
    ],
  },
};
