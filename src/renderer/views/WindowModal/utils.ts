export class FieldError extends Error {
  fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super('One or more fields contains errors');
    this.fields = fields;
  }
}

export const fields = {
  chordNotation: {
    choices: [
      {
        value: 'long',
        label: 'Long (min, maj, dom, aug, dim...)',
      },
      {
        value: 'short',
        label: 'Short (m, M, aug, dim...)',
      },
      {
        value: 'symbol',
        label: 'Symbol (-, Δ, +, °...)',
      },
      {
        value: 'preferred',
        label: 'Preferred (in dictionary)',
      },
    ],
  },
  keyboard: {
    skin: {
      choices: [
        {
          value: 'classic',
          label: 'Classic',
        },
        {
          value: 'flat',
          label: 'Flat',
        },
      ],
    },
    keyName: {
      choices: [
        { value: 'none', label: 'None' },
        { value: 'octave', label: 'Only C' },
        { value: 'pitchClass', label: 'Pitch Class' },
        { value: 'note', label: 'Note' },
      ],
    },
    keyInfo: {
      choices: [
        { value: 'none', label: 'None' },
        { value: 'tonic', label: 'Tonic Dot' },
        { value: 'interval', label: 'Chord Intervals' },
        { value: 'tonicAndInterval', label: 'Tonic Dot + Intervals' },
      ],
    },
    label: {
      choices: [
        { value: 'none', label: 'None' },
        { value: 'pitchClass', label: 'Pitch Class' },
        { value: 'note', label: 'Note' },
        { value: 'chordNote', label: 'Note in Chord' },
        { value: 'interval', label: 'Interval' },
      ],
    },
  },
};

export const transformId = (name: string) => {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
};
