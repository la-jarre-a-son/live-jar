import React from 'react';
import classNames from 'classnames/bind';
// @ts-ignore don't know how to fix
import ReactMarkdown from 'react-markdown';
import { Box } from '@la-jarre-a-son/ui';

import styles from './Changelog.module.scss';

import ChangelogMD from '../../../../../../CHANGELOG.md';

const cx = classNames.bind(styles);

const Changelog: React.FC = () => (
  <Box className={cx('base')} outlined elevation={1}>
    <ReactMarkdown skipHtml>{ChangelogMD}</ReactMarkdown>
  </Box>
);

export default Changelog;
