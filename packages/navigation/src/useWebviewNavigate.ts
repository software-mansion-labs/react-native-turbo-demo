import {
  getActionFromState,
  getStateFromPath,
  NavigationContainerRefContext,
} from '@react-navigation/core';
import * as React from 'react';
import LinkingContext from '@react-navigation/native/src/LinkingContext';
import extractPathFromURL from '@react-navigation/native/src/extractPathFromURL';
import { StackActions } from '@react-navigation/native';
import type {
  NavigationState,
  NavigatorScreenParams,
} from '@react-navigation/core';
import type { Action } from 'react-native-turbo';

type NavigateAction<State extends NavigationState> = {
  type: 'NAVIGATE';
  payload: {
    name: string;
    params?: NavigatorScreenParams<State>;
    path?: string;
  };
};

type To<
  ParamList extends ReactNavigation.RootParamList = ReactNavigation.RootParamList,
  RouteName extends keyof ParamList = keyof ParamList
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
  ParamList extends ReactNavigation.RootParamList
>() {
  const navigation: any = React.useContext(NavigationContainerRefContext);
  const linking: any = React.useContext(LinkingContext);

  const linkTo = React.useCallback(
    (to: To<ParamList>, actionType?: Action) => {
      if (navigation === undefined) {
        throw new Error(
          "Couldn't find a navigation object. Is your component inside NavigationContainer?"
        );
      }

      if (typeof to !== 'string') {
        navigation.navigate(to.screen, to.params);
        return;
      }

      const { options } = linking;

      const path = to.match(/^https?:\/\//)
        ? extractPathFromURL(options?.prefixes, to)
        : to;

      const state = options?.getStateFromPath
        ? options.getStateFromPath(path, options.config)
        : getStateFromPath(`${path}`, options?.config);

      if (state) {
        const action = <NavigateAction<NavigationState>>(
          getActionFromState(state, options?.config)
        );

        if (action === undefined) {
          navigation.reset(state);
        } else {
          const stackAction =
            actionType === 'replace' ? StackActions.replace : StackActions.push;

          navigation.dispatch({
            ...stackAction(action.payload.name, {
              ...action.payload.params,
              path,
            }),
          });
        }
      } else {
        throw new Error('Failed to parse the path to a navigation state.');
      }
    },
    [linking, navigation]
  );

  return linkTo;
}
