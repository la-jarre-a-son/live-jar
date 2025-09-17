import React, { useState, useRef, useEffect } from 'react';

import { bindClassNames, forwardRefWithAs } from '@la-jarre-a-son/ui';

import Icon from '../Icon';

import { AvatarProps } from './types';

import styles from './Avatar.module.scss';

const cx = bindClassNames(styles);

type AvatarStatics = {
  ICON_USER: string;
  AVATAR_TRANSITION_THRESHOLD: number;
};

type LoadStatus = 'idle' | 'loading' | 'loaded';

/**
 * Renders an User avatar, round or square, with an image or a text (user initials).
 */
export const Avatar = forwardRefWithAs<AvatarProps, 'div', AvatarStatics>(
  (props, ref) => {
    const {
      as,
      alt,
      image,
      onLoad,
      children,
      className,
      size: propSize,
      shape: propShape,
      outlined: propOutlined,
      online,
      ...otherProps
    } = props;
    const startLoadTime = useRef<number>(Date.now());
    const Element = as || 'div';

    // const groupProps = useAvatarGroup() || {};
    const groupProps = { size: 'md', shape: 'round', outlined: false };
    const size = propSize ?? groupProps?.size ?? 'md';
    const shape = propShape ?? groupProps?.shape ?? 'round';
    const outlined = propOutlined ?? groupProps?.outlined ?? false;

    const [status, setStatus] = useState<LoadStatus>('idle');
    const [skipTransition, setSkipTransition] = useState(false);

    useEffect(() => {
      // start loading after mount to skip image loading on server side
      setStatus('loading');
    }, []);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setStatus('loaded');
      if (
        Date.now() - startLoadTime.current <
        Avatar.AVATAR_TRANSITION_THRESHOLD
      ) {
        setSkipTransition(true);
      }
      if (onLoad) onLoad(e);
    };

    return (
      <Element
        ref={ref}
        className={cx(
          'root',
          size && `--${size}`,
          shape && `--${shape}`,
          outlined && `--outlined`,
          online && `--online`,
          status === 'loaded' && 'isLoaded',
          skipTransition && 'skipTransition',
          className,
        )}
        {...otherProps}
      >
        {children ||
          (status !== 'loaded' ? (
            <Icon
              className={cx('icon')}
              name={Avatar.ICON_USER as 'user' /* TEMP */}
              intent="subtle"
            />
          ) : null)}
        {status !== 'idle' && image && (
          <img
            className={cx('image')}
            src={image}
            alt={alt}
            onLoad={handleLoad}
          />
        )}
      </Element>
    );
  },
);

// Avatar.ICON_USER = 'fa-regular fa-user';
Avatar.AVATAR_TRANSITION_THRESHOLD = 60; // in milliseconds

Avatar.displayName = 'Avatar';

Avatar.defaultProps = {};

export default Avatar;
