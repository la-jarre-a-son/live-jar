import { AppApi, OsApi } from 'main/preload';

declare global {
  interface Window {
    app: typeof AppApi;
    os: typeof OsApi;
  }
}
