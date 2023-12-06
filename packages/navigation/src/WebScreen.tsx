import React from 'react';
import { LoadEvent, VisitableView, VisitProposal } from 'react-native-turbo';
import useWebviewNavigate from './useWebviewNavigate';

interface Props {
  navigation: any;
  route: any;
  baseURL: string;
}

const WebScreen: React.FC<Props> = (props) => {
  const { navigation, route } = props;
  const navigateTo = useWebviewNavigate();

  const path = route?.params?.path || route?.path || '';
  const baseURL = route?.params?.baseURL || props?.baseURL;
  const currentUrl = `${baseURL}${path}`;

  const onVisitProposal = ({ action: actionType, url }: VisitProposal) => {
    navigateTo(url, actionType);
  };

  const onLoad = ({ title }: LoadEvent) => {
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
