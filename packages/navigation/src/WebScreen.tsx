import React from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { OnLoadEvent, VisitableView, VisitProposal } from 'react-native-turbo';
import useWebviewNavigate from './useWebviewNavigate';

interface Props {
  navigation: any;
  route: any;
  baseURL: string;
}

const WebScreen: React.FC<Props> = ({ navigation, route, baseURL }) => {
  const navigateTo = useWebviewNavigate();

  const path = route?.params?.path || route?.path;
  const currentUrl = path ? `${baseURL}${path}` : baseURL;

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

  return (
    <VisitableView
      url={currentUrl}
      onVisitProposal={onVisitProposal}
      onLoad={onLoad}
    />
  );
};

export default WebScreen;
