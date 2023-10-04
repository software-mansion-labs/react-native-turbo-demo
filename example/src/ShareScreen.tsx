import React from 'react';
import { SessionMessageCallback } from 'react-native-turbo';
import WebView from './WebView';

const ShareScreen: React.FC<Props> = (props) => {
  const onMessage: SessionMessageCallback = (message: string) => {
    console.log(message);
  };
  return <WebView {...props} onMessage={onMessage} />;
};

export default ShareScreen;
