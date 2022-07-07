import {
  getActionFromState,
  getStateFromPath,
  NavigationContainerRefContext,
} from '@react-navigation/core';
import * as React from 'react';
import LinkingContext from '@react-navigation/native/src/LinkingContext';
import {Action} from './VisitableView';

export type To<
  ParamList extends ReactNavigation.RootParamList = ReactNavigation.RootParamList,
  RouteName extends keyof ParamList = keyof ParamList,
> =
  | string
  | (undefined extends ParamList[RouteName]
      ? {
          screen: Extract<RouteName, string>;
          params?: ParamList[RouteName];
        }
      : {
          screen: Extract<RouteName, string>;
          params: ParamList[RouteName];
        });

/*
 * Its like useLinkTo with some custom tweaks
 */
export default function useWebviewNavigate<
  ParamList extends ReactNavigation.RootParamList,
>() {
  const navigation = React.useContext(NavigationContainerRefContext);
  const linking = React.useContext(LinkingContext);

  const linkTo = React.useCallback(
    (to: To<ParamList>, actionType: Action) => {
      if (navigation === undefined) {
        throw new Error(
          "Couldn't find a navigation object. Is your component inside NavigationContainer?",
        );
      }

      if (typeof to !== 'string') {
        // @ts-expect-error: This is fine
        navigation.navigate(to.screen, to.params);
        return;
      }

      const {options} = linking;

      const state = options?.getStateFromPath
        ? options.getStateFromPath(to, options.config)
        : getStateFromPath(to, options?.config);

      console.log('state', state);

      if (state) {
        const action = getActionFromState(state, options?.config);

        if (action === undefined) {
          navigation.reset(state);
        } else {
          console.log('action', action);
          if (actionType === 'replace') {
            navigation.goBack();
          }
          navigation.dispatch(action);
        }
      } else {
        throw new Error('Failed to parse the path to a navigation state.');
      }
    },
    [linking, navigation],
  );

  return linkTo;
}
