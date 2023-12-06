import React from 'react';
import { LoadEvent, VisitableView, VisitProposal } from 'react-native-turbo';
import { useWebviewNavigate } from './hooks/useWebviewNavigate';
import { useCurrentUrl } from './hooks/useCurrentUrl';

interface Props {
  navigation: any;
  baseURL: string;
}

const WebScreen: React.FC<Props> = (props) => {
  const { navigation } = props;
  const navigateTo = useWebviewNavigate();
  const currentUrl = useCurrentUrl();

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
