import classnames from 'classnames/bind';
import { useParams } from 'react-router-dom';

import styles from './Chat.module.scss';

const cx = classnames.bind(styles);

export function ChatFrame() {
  const { channel } = useParams();
  return (
    <iframe
      className={cx('chat-frame')}
      title="chat"
      src={`http://www.twitch.tv/embed/${channel}/chat?darkpopout&parent=localhost`}
      height="100%"
      width="100%"
    />
  );
}

export default ChatFrame;
