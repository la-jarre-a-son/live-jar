import React from 'react';
import classnames from 'classnames/bind';

import { Badge, Button, Container, Link } from '@la-jarre-a-son/ui';

import logo from 'renderer/assets/logo.svg';
import { Icon } from 'renderer/components';

import Credits from './Credits';
import { CREDIT_ITEMS } from './constants';

import styles from './About.module.scss';
import Changelog from './Changelog';

const cx = classnames.bind(styles);

const About: React.FC = () => (
  <Container className={cx('base')} size="xl">
    <div className={cx('header')}>
      <img className={cx('logo')} src={logo} alt="" />
      <h1 className={cx('appname')}>
        Live Jar{' '}
        <Badge className={cx('version')}>{process.env.APP_VERSION}</Badge>
      </h1>
      <div className={cx('author')}>
        {'by Rémi Jarasson / '}
        <Link href="https://ljas.fr" target="_blank" rel="noreferrer">
          La Jarre à Son
        </Link>
      </div>
    </div>
    <h2 className={cx('title')}>Features</h2>
    <div className={cx('description')}>
      <p>
        This application is a multi-stream solution to watch simultaneously many
        streams on different screens.
      </p>
      <p>
        {"If you have any ideas to improve it, don't hesitate to "}
        <Button
          size="sm"
          intent="neutral"
          as="a"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/la-jarre-a-son/live-jar/issues/new?labels=bug&template=1-Bug_report.md"
        >
          <Icon name="github" />
          Report a bug
        </Button>
        {' or '}
        <Button
          size="sm"
          intent="neutral"
          as="a"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/la-jarre-a-son/live-jar/issues/new?labels=enhancement&template=2-Feature_request.md"
        >
          <Icon name="github" />
          Request a feature
        </Button>
      </p>
    </div>
    <h2 className={cx('title')}>Changelog</h2>
    <Changelog />
    <h2 className={cx('title')}>Special mentions</h2>
    <div className={cx('description')}>
      <p>
        Live Jar is based on a collection of amazing open-source projects and
        resources that deserve special mentions:
      </p>
    </div>
    <Credits items={CREDIT_ITEMS} />
    <h2 className={cx('title')}>Disclaimer</h2>
    <div className={cx('description')}>
      <p>
        Live Jar is not affiliated with{' '}
        <Link href="https://twitch.tv">Twitch</Link> or Amazon. All Trademarks
        referred to are the property of their respective owners.
      </p>
    </div>
  </Container>
);

export default About;
