import React from 'react';

export const AvatarSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export const AvatarShapes = ['round', 'square'] as const;

export type AvatarSize = (typeof AvatarSizes)[number];

export type AvatarShape = (typeof AvatarShapes)[number];

export type AvatarBaseProps = {
  /**
   * The avatar size (in teeshirt size)
   * */
  size?: AvatarSize;
  /**
   * The avatar shape
   */
  shape?: AvatarShape;
  /**
   * Displays an outline around avatar - defaults to `false`
   */
  outlined?: boolean;
  /**
   * Displays an outline around avatar to indicate online status - defaults to `false`
   */
  online?: boolean;
  /**
   * The image on load callback
   */
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  /**
   * The label / initials of avatar (displayed when no image / not loaded)
   */
  children?: React.ReactNode;
};

export type AvatarWithoutImageProps = {
  image?: undefined;
  alt?: undefined;
} & AvatarBaseProps;

export type AvatarWithImageProps = {
  /**
   * The image url of avatar image
   */
  image: string;
  /**
   *  The alt text for avatar image
   */
  alt: string;
} & AvatarBaseProps;

export type AvatarProps = AvatarWithoutImageProps | AvatarWithImageProps;
