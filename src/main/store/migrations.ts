/* eslint-disable @typescript-eslint/ban-ts-comment, camelcase */
import { Migrations } from 'conf/dist/source/types';
import Conf from 'conf';
import { StoreType } from '../types/Store';
import { v1_0_0_Settings, v1_0_1_Settings } from './legacy-types';

const migrations: Migrations<StoreType> = {
  '1.0.0': (store: Conf<StoreType>) => {
    store.set('version', '1.0.0');
  },
  '1.0.1': (store: Conf<StoreType>) => {
    store.set('version', '1.0.1');

    const settings = store.get('settings') as unknown as v1_0_0_Settings;

    const newSettings: v1_0_1_Settings = {
      ...settings,
      playlists: settings.playlists.map((p) => ({
        ...p,
        entries: p.entries.map((e) => e.toLowerCase()),
      })),
      appState: {
        changelogDismissed: null,
        updateDismissed: null,
      },
    };

    store.set('settings', newSettings);
  },
};

export default migrations;
