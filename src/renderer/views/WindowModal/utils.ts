export class FieldError extends Error {
  fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super('One or more fields contains errors');
    this.fields = fields;
  }
}

export const fields = {
  quality: {
    choices: [
      {
        value: 'auto',
        label: 'Automatic',
      },
      {
        value: 'chunked',
        label: 'Source',
      },
      {
        value: '1080p60',
        label: '1080p60',
      },
      {
        value: '1080p30',
        label: '1080p30',
      },
      {
        value: '720p60',
        label: '720p60',
      },
      {
        value: '720p30',
        label: '720p30',
      },
      {
        value: '480p30',
        label: '480p30',
      },
      {
        value: '360p30',
        label: '360p30',
      },
      {
        value: '160p30',
        label: '160p30',
      },
    ],
  },
};
