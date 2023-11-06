import {
  getActionFromState,
  getStateFromPath,
  NavigationContainerRefContext,
} from '@react-navigation/native';
import * as React from 'react';
import LinkingContext from '@react-navigation/native/src/LinkingContext';
import extractPathFromURL from '@react-navigation/native/src/extractPathFromURL';
import { CommonActions } from '@react-navigation/native';
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

const parseQueryStringFromPath = (path: string) => {
  let pathWithoutQueryString = path;
  let queryString = '';
  const queryStringIndex = path.indexOf('?');

  if (queryStringIndex !== -1) {
    pathWithoutQueryString = path.slice(0, queryStringIndex);
    queryString = path.slice(queryStringIndex + 1);
  }

  return { pathWithoutQueryString, queryString };
};

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

      const path =
        (to.match(/^https?:\/\//)
          ? extractPathFromURL(options?.prefixes, to)
          : to) ?? '';

      /* We need to send the path name as screen param
      to the screen this way cause it works also for nested navigators */
      const { pathWithoutQueryString, queryString } =
        parseQueryStringFromPath(path);
      const pathWithScreenParams = `${pathWithoutQueryString}?${queryString}&path=${pathWithoutQueryString}`;

      const state = options?.getStateFromPath
        ? options.getStateFromPath(pathWithScreenParams, options.config)
        : getStateFromPath(pathWithScreenParams, options?.config);

      if (state) {
        const action = <NavigateAction<NavigationState>>(
          getActionFromState(state, options?.config)
        );

        if (action === undefined) {
          navigation.reset(state);
        } else {
          const actionToDispatch =
            actionType === 'replace'
              ? CommonActions.setParams({ path })
              : CommonActions.navigate(action.payload.name, {
                  ...action.payload.params,
                });

          navigation.dispatch(actionToDispatch);
        }
      } else {
        throw new Error('Failed to parse the path to a navigation state.');
      }
    },
    [linking, navigation]
  );

  return linkTo;
}
