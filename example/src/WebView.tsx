import React, { useCallback } from 'react';
import {
  LoadEvent,
  VisitableView,
  VisitProposal,
  VisitableViewProps,
} from 'react-native-turbo';
import { useCurrentUrl, useWebviewNavigate } from 'react-native-web-screen';
import Form from './Strada/Form';
import { RootStackParamList, baseURL, linkingConfig } from './webScreen';
import { NavigationProp } from '@react-navigation/native';

export type Props = {
  navigation: NavigationProp<RootStackParamList>;
} & Pick<VisitableViewProps, 'onMessage' | 'renderError' | 'onError'>;

const sessionHandle = 'TurboWebviewExample';
const stradaComponents = [Form];

const WebView: React.FC<Props> = ({ navigation, ...props }) => {
  const navigateTo = useWebviewNavigate();

  const currentUrl = useCurrentUrl(baseURL, linkingConfig);

  const onVisitProposal = useCallback(
    ({ action: actionType, url }: VisitProposal) => {
      navigateTo(url, actionType);
    },
    [navigateTo]
  );

  const onLoad = useCallback(
    ({ title }: LoadEvent) => {
      navigation.setOptions({ title });
    },
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
