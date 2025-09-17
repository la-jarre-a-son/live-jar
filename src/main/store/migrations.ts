/* eslint-disable @typescript-eslint/ban-ts-comment, camelcase */
import { Migrations } from 'conf/dist/source/types';
import Conf from 'conf';
import { StoreType } from '../types/Store';

const migrations: Migrations<StoreType> = {
  '1.0.0': (store: Conf<StoreType>) => {
    store.set('version', '1.0.0');
  },
};

export default migrations;
