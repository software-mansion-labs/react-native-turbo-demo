import {
  getActionFromState,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import extractPathFromURL from '@react-navigation/native/src/extractPathFromURL';
import { CommonActions } from '@react-navigation/native';
import type {
  NavigationState,
  NavigatorScreenParams,
} from '@react-navigation/core';
import type { Action } from 'react-native-turbo';
import { unpackState } from '../utils/unpackState';
import { ConfigurationContext } from '../WebScreenNavigation';
import { useCallback, useContext } from 'react';
import { getWebScreenStateFromPath } from '../buildWebScreen';

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

function isNavigateAction(
  action: ReturnType<typeof getActionFromState>
): action is NavigateAction<NavigationState> {
  return !!action && action.type === 'NAVIGATE';
}

function getAction(
  action: NavigateAction<NavigationState>,
  actionType: Action | undefined
) {
  if (actionType === 'replace') {
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
  const { baseURL, linkingConfig } = useContext(ConfigurationContext);
  const navigation = useNavigation();

  const linkTo = useCallback(
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

      let path = to;

      if (to.startsWith(baseURL)) {
        path = extractPathFromURL([baseURL], to) ?? '';
      }
      const state = getWebScreenStateFromPath(path, linkingConfig, baseURL);

      if (state) {
        // for REPLACE action we need to pass only top of navigation state.
        const actionState =
          actionType === 'replace' ? unpackState(state) : state;
        const action = getActionFromState(actionState, linkingConfig);
        if (isNavigateAction(action)) {
          const actionToDispatch = getAction(action, actionType);

          navigation.dispatch(actionToDispatch);
        } else if (action === undefined) {
          // @ts-expect-error
          navigation.reset(state);
        }
      } else {
        throw new Error('Failed to parse the path to a navigation state.');
      }
    },
    [baseURL, linkingConfig, navigation]
  );

  return linkTo;
}
