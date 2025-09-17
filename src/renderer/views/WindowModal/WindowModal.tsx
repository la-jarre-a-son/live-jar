import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  FormField,
  Modal,
  ModalHeader,
  ModalContent,
  ModalActions,
  ModalActionsSeparator,
  Input,
  StateButton,
} from '@la-jarre-a-son/ui';

import { useWindow } from 'renderer/contexts/Settings';
import { FieldError } from './utils';

const WindowModal: React.FC = () => {
  const { id: paramId } = useParams();
  const id = Number.isNaN(parseInt(paramId ?? '', 10))
    ? null
    : parseInt(paramId ?? '', 10);

  const navigate = useNavigate();
  const { windowSettings } = useWindow(id);
  const [label, setLabel] = useState<string>(windowSettings?.label ?? '');
  const [channel, setChannel] = useState<string>(
    windowSettings?.type === 'twitch' ? (windowSettings?.channel ?? '') : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = () => {
    if (!id) {
      return window.app.stream
        .add({ type: 'twitch', label, channel })
        .then(() => {
          return navigate('/');
        })
        .catch((err) =>
          err instanceof FieldError ? setErrors(err.fields) : null,
        );
    }
    return window.app.stream
      .update(id, { label, channel })
      .then(() => {
        return navigate('/');
      })
      .catch((err) =>
        err instanceof FieldError ? setErrors(err.fields) : null,
      );
  };

  return (
    <Modal open={!!window} size="md" onClose={handleCancel} disableAutoFocus>
      <ModalHeader
        title={id ? `Edit Window "${windowSettings.label}"` : 'Add Window'}
      />
      <ModalContent>
        <FormField label="Window Label" error={errors.id}>
          <Input value={label} onChange={setLabel} autoFocus />
        </FormField>
        <FormField label="Twitch Channel" error={errors.channel}>
          <Input value={channel} onChange={setChannel} />
        </FormField>
      </ModalContent>
      <ModalActions>
        <Button variant="ghost" intent="neutral" onClick={handleCancel}>
          Cancel
        </Button>
        <ModalActionsSeparator />
        <StateButton intent="success" onClick={handleSave}>
          {id ? 'Update Window' : 'Add Window'}
        </StateButton>
      </ModalActions>
    </Modal>
  );
};

export default WindowModal;
