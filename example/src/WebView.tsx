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
import { useSessionHandle } from './useSessionHandle';
import { navigationRef } from './navigationRef';

export type Props = {
  navigation: NavigationProp<RootStackParamList>;
} & Pick<VisitableViewProps, 'onMessage' | 'renderError' | 'onError'>;

const stradaComponents = [Form];

// This object is dynamically filled while navigating
const modalNavigators = new Set<string>();

const WebView: React.FC<Props> = ({ navigation, ...props }) => {
  const { getDispatchUtilities } = useWebviewNavigate();

  const currentUrl = useCurrentUrl(baseURL, linkingConfig);

  const sessionHandle = useSessionHandle();

  const onVisitProposal = useCallback(
    ({ action: actionType, url }: VisitProposal) => {
      // Before navigating, if we are changing the topmost navigator
      // and the current navigator has modals, make sure to close them
      const {
        state,
        actionToDispatch,
        willChangeTopmostNavigator,
        rootNavigator,
      } = getDispatchUtilities(url, actionType);
      const rootState = rootNavigator.getState();
      const currentScreenName = rootState?.routes[rootState.index ?? -1]?.name;
      const currentOptions = navigationRef?.getCurrentOptions();

      if (
        currentOptions &&
        currentScreenName &&
        'presentation' in currentOptions &&
        currentOptions.presentation !== 'card'
      ) {
        modalNavigators.add(currentScreenName);
      }

      if (
        currentScreenName &&
        willChangeTopmostNavigator &&
        modalNavigators.has(currentScreenName) &&
        navigation.canGoBack()
      ) {
        // @ts-expect-error
        rootNavigator.popToTop();
      }

      if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
      }

      if (actionToDispatch) {
        navigation.dispatch(actionToDispatch);
      } else {
        // @ts-expect-error
        navigation.reset(state);
      }
    },
    [getDispatchUtilities, navigation]
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
