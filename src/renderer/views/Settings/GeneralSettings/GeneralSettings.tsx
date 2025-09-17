import React, { useEffect, useState } from 'react';
import { defaults } from 'main/store/defaults';
import { useSettings } from 'renderer/contexts/Settings';
import classnames from 'classnames/bind';

import {
  Badge,
  Button,
  Container,
  FormControlLabel,
  FormField,
  FormFieldset,
  Modal,
  ModalActions,
  ModalActionsSeparator,
  ModalContent,
  Select,
  Slider,
  Stack,
  StateButton,
  Switch,
} from '@la-jarre-a-son/ui';
import { useApiTwitch } from 'renderer/contexts/ApiTwitch';
import { HelixPrivilegedUser } from '@twurple/api';
import { Icon, Avatar } from 'renderer/components';
import { fields } from './constants';

import styles from './GeneralSettings.module.scss';

const cx = classnames.bind(styles);

/**
 *  General settings page
 */
const GeneralSettings: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { getAuthenticatedUser } = useApiTwitch();
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] =
    useState<HelixPrivilegedUser | null>(null);

  const loginTwitch = () => {
    window.app.login();
  };

  const logoutTwitch = () => {
    setLogoutAlertOpen(true);
  };

  const confirmLogoutTwitch = () => {
    window.app.logout();
    setLogoutAlertOpen(false);
  };

  useEffect(() => {
    if (settings.auth.twitch) {
      setAuthLoading(true);
      getAuthenticatedUser()
        .then(setAuthenticatedUser)
        .catch(() => {
          setAuthLoading(false);
          setAuthenticatedUser(null);
        });
    } else {
      setAuthLoading(false);
      setAuthenticatedUser(null);
    }
  }, [settings.auth.twitch, getAuthenticatedUser]);

  return (
    <Container size="md">
      <FormControlLabel label="Reopen windows" reverse>
        <Switch
          checked={settings.general.reopenWindows}
          onChange={(value) => updateSetting('general.reopenWindows', value)}
        />
      </FormControlLabel>
      <FormFieldset label="Authentication">
        {authenticatedUser ? (
          <Stack align="center" gap="md" block>
            <Icon className={cx('twitchIcon')} name="twitch" intent="inherit" />
            <Avatar
              size="md"
              alt="Profile Picture"
              image={authenticatedUser.profilePictureUrl}
              outlined
            />
            <div className={cx('userDisplayName')}>
              {authenticatedUser.displayName}
            </div>
            <Button
              className={cx('twitch')}
              onClick={logoutTwitch}
              intent="danger"
            >
              Logout
            </Button>
          </Stack>
        ) : (
          <StateButton
            className={cx('twitch')}
            onClick={loginTwitch}
            loading={authLoading}
            left={<Icon name="twitch" />}
            block
          >
            Login
          </StateButton>
        )}
      </FormFieldset>
      <FormFieldset label="Stream Window">
        <FormField label="Topbar Style">
          <Select
            options={fields.topbarStyle.choices}
            onChange={(value) => updateSetting('general.topbarStyle', value)}
            value={settings.general.topbarStyle}
          />
        </FormField>
        <FormField
          label="Volume Scroll Speed"
          hint="How fast scrolling changes the stream volume. 0 = disable the feature"
        >
          <Slider
            value={settings.general.volumeScrollSpeed}
            onChange={(value: number | number[]) =>
              updateSetting('general.volumeScrollSpeed', Number(value))
            }
            min={0}
            max={1}
            step={0.1}
            marks={[defaults.settings.general.volumeScrollSpeed]}
            valueText={settings.general.volumeScrollSpeed.toFixed(1)}
          />
        </FormField>
        <FormField
          label="High Latency Threshold"
          hint="Threshold above which latency is considered too high"
        >
          <Slider
            value={settings.general.latencyHighThreshold}
            onChange={(value: number | number[]) =>
              updateSetting('general.latencyHighThreshold', Number(value))
            }
            min={1}
            max={15}
            step={1}
            marks={[defaults.settings.general.latencyHighThreshold]}
            valueText={`${settings.general.latencyHighThreshold.toFixed(0)}s`}
          />
        </FormField>
        <FormControlLabel
          label={
            <>
              Refresh High Latency&nbsp;
              <Badge size="sm" intent="warning">
                Experimental
              </Badge>
            </>
          }
          hint="Stream will auto refresh when latency is higher than threshold"
          reverse
        >
          <Switch
            checked={settings.general.autoRefreshHighLatency}
            onChange={(value) =>
              updateSetting('general.autoRefreshHighLatency', value)
            }
          />
        </FormControlLabel>
        <FormField
          label="Mute Preroll Timeout"
          hint="Mutes the stream during preroll ad. Recommended = 15s if prerolls are shown."
        >
          <Slider
            value={settings.general.mutePrerollTimeout}
            onChange={(value: number | number[]) =>
              updateSetting('general.mutePrerollTimeout', Number(value))
            }
            min={0}
            max={30}
            step={5}
            marks={[defaults.settings.general.mutePrerollTimeout]}
            valueText={`${settings.general.mutePrerollTimeout.toFixed(0)}s`}
          />
        </FormField>
        <FormField
          label="Double-click Action"
          hint="Choose the action associated with double click"
        >
          <Select
            options={fields.doubleClickAction.choices}
            onChange={(value) =>
              updateSetting('general.doubleClickAction', value)
            }
            value={settings.general.doubleClickAction}
          />
        </FormField>
      </FormFieldset>
      <Modal open={logoutAlertOpen} onClose={() => setLogoutAlertOpen(false)}>
        <ModalContent>
          Are you sure you want to log out from Twitch ?
        </ModalContent>
        <ModalActions>
          <Button
            intent="neutral"
            onClick={() => setLogoutAlertOpen(false)}
            variant="ghost"
          >
            Cancel
          </Button>
          <ModalActionsSeparator />
          <Button onClick={confirmLogoutTwitch} intent="danger">
            Logout
          </Button>
        </ModalActions>
      </Modal>
    </Container>
  );
};

export default GeneralSettings;
