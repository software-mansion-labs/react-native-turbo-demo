import { NavigationProp } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  LoadEvent,
  VisitableView,
  VisitProposal,
  VisitableViewProps,
} from 'react-native-turbo';
import { useCurrentUrl, useWebviewNavigate } from 'react-native-web-screen';

import Form from './Strada/Form';
import { useSessionHandle } from './useSessionHandle';
import { RootStackParamList, baseURL, linkingConfig } from './webScreen';

export type Props = {
  navigation: NavigationProp<RootStackParamList>;
} & Pick<VisitableViewProps, 'onMessage' | 'renderError' | 'onError'>;

const stradaComponents = [Form];

const WebView: React.FC<Props> = ({ navigation, ...props }) => {
  const { navigateTo } = useWebviewNavigate();
  const currentUrl = useCurrentUrl(baseURL, linkingConfig);
  const sessionHandle = useSessionHandle();

  const onVisitProposal = useCallback(
    ({ action: actionType, url }: VisitProposal) => navigateTo(url, actionType),
    [navigation]
  );

  const onLoad = useCallback(
    ({ title }: LoadEvent) => navigation.setOptions({ title }),
    [navigation]
  );

  return (
    <VisitableView
      {...props}
      sessionHandle={sessionHandle}
      url={currentUrl}
      applicationNameForUserAgent="Turbo Native"
      stradaComponents={stradaComponents}
      onVisitProposal={onVisitProposal}
      onLoad={onLoad}
    />
  );
};

export default WebView;
