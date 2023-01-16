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

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
}

const WebviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const navigateTo = useWebviewNavigate();

  const path = route?.params?.path || route?.path;
  const currentUrl = path ? `${BASE_URL}${path}` : BASE_URL;

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
