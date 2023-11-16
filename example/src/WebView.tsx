import React from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import {
  OnLoadEvent,
  VisitableView,
  VisitProposal,
  OnErrorCallback,
} from 'react-native-turbo';
import { useWebviewNavigate } from 'react-native-web-screen';
import { Routes } from './webScreenRoutes';

interface Props {
  navigation: any;
  route: any;
  baseURL: string;
}

const sessionHandle = 'TurboWebviewExample';

const WebView: React.FC<Props> = (props) => {
  const { navigation, route } = props;
  const navigateTo = useWebviewNavigate();
  const path = route?.params?.path || route?.path || '';
  const baseURL = route?.params?.baseURL || props?.baseURL;
  const currentUrl = `${baseURL}${path}`;

  const onVisitProposal = ({
    nativeEvent: { action: actionType, url },
  }: NativeSyntheticEvent<VisitProposal>) => {
    navigateTo(url, actionType);
  };

  const onLoad = ({
    nativeEvent: { title },
  }: NativeSyntheticEvent<OnLoadEvent>) => {
    navigation.setOptions({ title });
  };

  const onVisitError: OnErrorCallback = (error) => {
    const notLoggedIn = error.statusCode === 401;
    if (notLoggedIn) {
      navigation.navigate(Routes.SignIn, { path: 'signin' });
    }
  };

  return (
    <VisitableView
      {...props}
      sessionHandle={sessionHandle}
      url={currentUrl}
      onVisitProposal={onVisitProposal}
      onLoad={onLoad}
      onVisitError={onVisitError}
    />
  );
};

export default WebView;
