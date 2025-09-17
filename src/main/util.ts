/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import QueryString from 'qs';
import { AuthToken } from './types';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

export function resolveHtmlPath(
  htmlFileName: string,
  qs?: string,
  hash?: string,
) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1213;
    const url = new URL(
      `http://localhost:${port}?${qs ?? ''}${hash ? `#${hash}` : ''}`,
    );
    url.pathname = htmlFileName;
    return url.href;
  }

  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}?${qs ?? ''}${hash ? `#${hash}` : ''}`;
}

export const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export const getURLHash = (url: string) => {
  const index = url.indexOf('#');

  if (index !== -1) {
    return url.substring(index + 1);
  }
  return '/';
};

export const deepEqual = (x: unknown, y: unknown) => {
  if (x === y) {
    return true;
  }
  if (
    typeof x === 'object' &&
    x != null &&
    typeof y === 'object' &&
    y != null
  ) {
    if (Object.keys(x).length !== Object.keys(y).length) {
      return false;
    }

    // FIXME
    // eslint-disable-next-line
    for (const prop of Object.keys(x)) {
      if (Object.hasOwn(y, prop)) {
        // @ts-ignore
        if (!deepEqual(x[prop], y[prop])) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }
  return false;
};

export const extractAccessToken = (uri: string): AuthToken | null => {
  const url = new URL(uri);
  const info = QueryString.parse(url.hash.slice(1));

  if (
    typeof info.access_token === 'string' &&
    info.token_type === 'bearer' &&
    typeof info.scope === 'string'
  ) {
    return {
      accessToken: info.access_token,
      type: info.token_type,
      scopes: info.scope.split(' '),
    };
  }

  // eslint-disable-next-line
  console.error('Cannot parse Auth Token', info);
  return null;
};
