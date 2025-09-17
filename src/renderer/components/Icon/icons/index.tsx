import React from 'react';

export const ICON_NAMES = [
  'angle-down',
  'angle-left',
  'angle-right',
  'angle-up',
  'bug',
  'copyright',
  'comments',
  'check',
  'clock',
  'controller',
  'cross',
  'exclamation',
  'github',
  'heart',
  'hidden',
  'info',
  'loading',
  'lock',
  'menu-dots',
  'minimize',
  'minus',
  'maximize',
  'unmaximize',
  'pin',
  'power',
  'plus',
  'refresh',
  'reset',
  'save',
  'search',
  'settings',
  'star',
  'star-filled',
  'trash',
  'twitch',
  'user',
  'visible',
  'window',
  'windows',
] as const;

const ICONS = ICON_NAMES.reduce(
  (obj, name: string) => {
  obj[name] = require(`./${name}.react.svg`).default; // eslint-disable-line
    return obj;
  },
  {} as { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> },
);

export default ICONS;
