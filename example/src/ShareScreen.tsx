import React from 'react';
import type { SessionMessageCallback } from 'react-native-turbo';
import WebView, { type Props } from './WebView';

const ShareScreen: React.FC<Props> = (props) => {
  const onMessage: SessionMessageCallback = (message) => {
    console.log(message);
  };
  return <WebView {...props} onMessage={onMessage} />;
};

export default ShareScreen;
