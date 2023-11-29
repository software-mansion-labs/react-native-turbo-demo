import React from 'react';
import type { SessionMessageCallback } from 'react-native-turbo';
import WebView, { type Props } from './WebView';
import { Share } from 'react-native';

type MessageType = { message: { method: 'share'; shareText: string } };

const ShareScreen: React.FC<Props> = (props) => {
  const onMessage: SessionMessageCallback = async (message) => {
    const {
      message: { shareText },
    } = message as MessageType;
    Share.share({
      title: 'Share React Native Web Screen library',
      message: shareText,
    });
  };
  return <WebView {...props} onMessage={onMessage} />;
};

export default ShareScreen;
