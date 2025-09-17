import { JSONSchema } from 'json-schema-typed';

import SettingsSchema from '../types/Settings.schema.json';

export const schema = {
  settings: SettingsSchema as JSONSchema,
};
