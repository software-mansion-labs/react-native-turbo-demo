import {
  getActionFromState,
  getStateFromPath,
  NavigationContainerRefContext,
  StackActions,
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

function isNavigateAction(
  action: ReturnType<typeof getActionFromState>
): action is NavigateAction<NavigationState> {
  return !!action && action.type === 'NAVIGATE';
}

function getAction(
  action: NavigateAction<NavigationState>,
  actionType: Action | undefined,
  path: string,
  isModal: boolean
) {
  if (actionType === 'replace') {
    if (isModal) {
      return CommonActions.setParams({ path });
    }
    return StackActions.replace(action.payload.name, {
      ...action.payload.params,
      __disable_animation: true,
    });
  } else {
    const { name, params } = action.payload;
    const key =
      (params && 'fullPath' in params && (params.fullPath as string)) ||
      undefined;
    return CommonActions.navigate({
      name,
      key,
      params,
    });
  }
}

/*
 * Its like useLinkTo with some custom tweaks
 */
export function useWebviewNavigate<
  ParamList extends ReactNavigation.RootParamList
>() {
  const navigation = React.useContext(NavigationContainerRefContext);
  const linking = React.useContext(LinkingContext);

  const linkTo = React.useCallback(
    (to: To<ParamList>, actionType?: Action) => {
      if (navigation === undefined) {
        throw new Error(
          "Couldn't find a navigation object. Is your component inside NavigationContainer?"
        );
      }

      if (to && typeof to !== 'string') {
        // @ts-expect-error
        navigation.navigate(to.screen, to.params);
        return;
      }

      const { options } = linking;

      let path = to;
      if (options?.prefixes && to.match(/^https?:\/\//)) {
        path = extractPathFromURL(options.prefixes, to) ?? '';
      }

      /* We need to send the path name as screen param
      to the screen this way cause it works also for nested navigators */
      const { pathWithoutQueryString, queryString } =
        parseQueryStringFromPath(path);
      const pathWithScreenParams = `${pathWithoutQueryString}?${queryString}&path=${pathWithoutQueryString}`;

      const state = options?.getStateFromPath
        ? options.getStateFromPath(pathWithScreenParams, options.config)
        : getStateFromPath(pathWithScreenParams, options?.config);

      if (state) {
        const action = getActionFromState(state, options?.config);

        if (isNavigateAction(action)) {
          const currentOptions = navigation.getCurrentOptions();
          const isModal =
            !!currentOptions &&
            'presentation' in currentOptions &&
            currentOptions.presentation === 'modal';

          const actionToDispatch = getAction(action, actionType, path, isModal);

          navigation.dispatch(actionToDispatch);
        } else if (action === undefined) {
          navigation.reset(state);
        }
      } else {
        throw new Error('Failed to parse the path to a navigation state.');
      }
    },
    [linking, navigation]
  );

  return linkTo;
}
