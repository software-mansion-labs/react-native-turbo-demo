import React, { useCallback, useRef } from 'react';
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
  const ref = useRef(null);
  const navigateTo = useWebviewNavigate();

  const currentUrl = useCurrentUrl(baseURL, linkingConfig);

  const setWebViewVisibilityState = useCallback(
    (isScreenFocused) => {
      // @ts-ignore
      ref.current?.injectJavaScript(`
        document.dispatchEvent(new CustomEvent('nativeVisibilityChange', {
          detail: {
            isVisible: ${isScreenFocused},
            url: '${currentUrl}'
          }
        }));
    `);
    },
    [currentUrl]
  );

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

  const onWebViewMount = useCallback(() => {
    setWebViewVisibilityState(true);
  }, [setWebViewVisibilityState]);

  const onWebViewUnmount = useCallback(() => {
    setWebViewVisibilityState(false);
  }, [setWebViewVisibilityState]);

  return (
    <VisitableView
      {...props}
      ref={ref}
      sessionHandle={sessionHandle}
      url={currentUrl}
      applicationNameForUserAgent="Turbo Native"
      stradaComponents={stradaComponents}
      onVisitProposal={onVisitProposal}
      onLoad={onLoad}
      onWebViewMount={onWebViewMount}
      onWebViewUnmount={onWebViewUnmount}
    />
  );
};

export default WebView;
