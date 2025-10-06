import React, { Fragment, useState } from 'react';

import classnames from 'classnames/bind';

import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Container,
  FormField,
  Icon,
  Input,
  List,
  ListItem,
  Modal,
  ModalActions,
  ModalActionsSeparator,
  ModalContent,
  ModalHeader,
  Stack,
  StateButton,
  useEvent,
} from '@la-jarre-a-son/ui';

import { ChannelPlaylistType } from 'main/types';

import { useSettings } from 'renderer/contexts/Settings';

import styles from './Playlists.module.scss';

class FieldError extends Error {
  fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super('One or more fields contains errors');
    this.fields = fields;
  }
}

const cx = classnames.bind(styles);

/**
 * Playlists page
 */
const Playlists: React.FC = () => {
  const { settings } = useSettings();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inputText, setInputText] = useState<Record<string, string>>({});

  const updateInputText = (key: string, text: string) => {
    setInputText((obj) => {
      return { ...obj, [key]: text };
    });
  };

  const addEntry = useEvent((label: string, type: ChannelPlaylistType) => {
    const key = `${label}:${type}`;
    const entry = inputText[key];
    window.app.playlists.add(label, type, entry);
    updateInputText(key, '');
  });

  const deleteEntry = useEvent(
    (label: string, type: ChannelPlaylistType, entry: string) => {
      window.app.playlists.remove(label, type, entry);
    },
  );

  const deletePlaylist = useEvent(
    (label: string, type: ChannelPlaylistType) => {
      window.app.playlists.delete(label, type);
    },
  );

  const addPlaylist = () => {
    return window.app.playlists
      .add(inputText.playlistLabel, 'twitch', '')
      .then(() => {
        updateInputText('playlistLabel', '');

        return setAddModalOpen(false);
      })
      .catch((err) =>
        err instanceof FieldError ? setErrors(err.fields) : null,
      );
  };

  return (
    <Container size="md">
      {settings.playlists.map(
        (playlist) =>
          playlist.label !== 'followed' && (
            <Fragment key={`${playlist.label}:${playlist.type}`}>
              <Stack className={cx('playlistHeader')} gap="md" align="center">
                <Badge intent="primary" size="sm">
                  {playlist.type}
                </Badge>
                <div className={cx('playlistTitle')}>{playlist.label}</div>
                <Button
                  onClick={() => deletePlaylist(playlist.label, playlist.type)}
                  size="sm"
                  intent="danger"
                  left={<Icon name="fi fi-rr-trash" />}
                >
                  Remove
                </Button>
              </Stack>

              <Box className={cx('playlistContent')} elevation={2}>
                <List>
                  {playlist.entries.map((entry) => (
                    <ListItem
                      key={entry}
                      className={cx('entry')}
                      right={
                        <ButtonGroup>
                          <Button
                            intent="danger"
                            onClick={() =>
                              deleteEntry(playlist.label, playlist.type, entry)
                            }
                            icon
                            aria-label="Remove entry"
                          >
                            <Icon name="fi fi-rr-trash" />
                          </Button>
                        </ButtonGroup>
                      }
                    >
                      <div className={cx('channel')}>{entry}</div>
                    </ListItem>
                  ))}

                  <ListItem
                    className={cx('addEntry')}
                    right={
                      <ButtonGroup>
                        <Button
                          intent="success"
                          onClick={() =>
                            addEntry(playlist.label, playlist.type)
                          }
                          icon
                          aria-label="Add entry"
                        >
                          <Icon name="fi fi-rr-plus" />
                        </Button>
                      </ButtonGroup>
                    }
                  >
                    <Input
                      value={
                        inputText[`${playlist.label}:${playlist.type}`] ?? ''
                      }
                      placeholder="Add channels (comma-separated)..."
                      onChange={(text) =>
                        updateInputText(
                          `${playlist.label}:${playlist.type}`,
                          text,
                        )
                      }
                      block
                    />
                  </ListItem>
                </List>
              </Box>
            </Fragment>
          ),
      )}
      <Button
        onClick={() => setAddModalOpen(true)}
        size="md"
        intent="success"
        block
      >
        Add new playlist
      </Button>
      <Modal
        open={addModalOpen}
        size="md"
        onClose={() => setAddModalOpen(false)}
        disableAutoFocus
      >
        <ModalHeader title="Add a new playlist" />
        <ModalContent>
          <FormField label="Label" error={errors.id}>
            <Input
              value={inputText.newPlaylist}
              onChange={(text) => updateInputText('playlistLabel', text)}
              autoFocus
            />
          </FormField>
        </ModalContent>
        <ModalActions>
          <Button
            variant="ghost"
            intent="neutral"
            onClick={() => setAddModalOpen(false)}
          >
            Cancel
          </Button>
          <ModalActionsSeparator />
          <StateButton intent="success" onClick={addPlaylist}>
            Add Playlist
          </StateButton>
        </ModalActions>
      </Modal>
    </Container>
  );
};

export default Playlists;
