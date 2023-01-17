import React from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { BASE_URL, Routes } from './config';
import {
  VisitableView,
  OnLoadEvent,
  VisitProposal,
  VisitProposalError,
} from 'react-native-turbo';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useWebviewNavigate } from '@react-native-turbo-webview/navigation';
// import { useCallback } from 'react';
// import { Share } from 'react-native';

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

const WebviewScreen: React.FC<Props> = ({ navigation, route }) => {
  // const sessionRef = useRef<VisitableView>(null);
  const navigateTo = useWebviewNavigate();

  const path = route?.params?.path || route?.path;
  const currentUrl = path ? `${BASE_URL}${path}` : BASE_URL;

  // const share = async (message: string) => {
  //   const res = await Share.share({ message });
  //   if (res.action === 'sharedAction') {
  //     sessionRef.current?.injectJavaScript(`shared()`);
  //   }
  // };

  // const handleMessage = useCallback<SessionMessageCallback>((message) => {
  //   console.warn('message', message);
  //   switch (message.method) {
  //     case 'share': {
  //       share(message.shareText);
  //       break;
  //     }
  //   }
  // }, []);

  const onVisitProposal = ({
    nativeEvent: { action: actionType, url },
  }: NativeSyntheticEvent<VisitProposal>) => {
    navigateTo(url, actionType);
  };

  const onVisitError = ({
    nativeEvent: { statusCode },
  }: NativeSyntheticEvent<VisitProposalError>) => {
    switch (statusCode) {
      case 401: {
        navigateTo(`signin`);
        break;
      }
      default: {
        navigation.replace(Routes.NotFound);
      }
    }
  };

  const onLoad = ({
    nativeEvent: { title },
  }: NativeSyntheticEvent<OnLoadEvent>) => {
    navigation.setOptions({ title });
  };

  return (
    <VisitableView
      url={currentUrl}
      onVisitProposal={onVisitProposal}
      onVisitError={onVisitError}
      onLoad={onLoad}
    />
  );
};

export default WebviewScreen;
