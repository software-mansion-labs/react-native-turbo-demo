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
import { NavigationProp, useFocusEffect } from '@react-navigation/native';

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
    (isFocused) => {
      // TODO: injectJavaScript called to early
      setTimeout(() => {
        // @ts-ignore
        ref.current?.injectJavaScript(`
        document.dispatchEvent(new CustomEvent('nativeVisibilityChange', {
          'detail': {
            isVisible: ${isFocused},
            url: '${currentUrl}'
          }
        }));
      `);
      }, 300);
    },
    [currentUrl]
  );

  useFocusEffect(
    useCallback(() => {
      setWebViewVisibilityState(true);
      return () => {
        setWebViewVisibilityState(false);
      };
    }, [setWebViewVisibilityState])
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
    />
  );
};

export default WebView;
