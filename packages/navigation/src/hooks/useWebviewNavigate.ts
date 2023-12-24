import {
  getActionFromState,
  getStateFromPath,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import * as React from 'react';
import LinkingContext from '@react-navigation/native/src/LinkingContext';
import extractPathFromURL from '@react-navigation/native/src/extractPathFromURL';
import { CommonActions } from '@react-navigation/native';
import {
  useRoute,
  type NavigationState,
  type NavigatorScreenParams,
} from '@react-navigation/core';
import type { Action } from 'react-native-turbo';
import { unpackState } from '../utils/unpackState';

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
    return StackActions.replace(action.payload.name, action.payload.params);
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
  const navigation = useNavigation();
  const linking = React.useContext(LinkingContext);
  const route = useRoute();

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
      const state = options?.getStateFromPath
        ? options.getStateFromPath(path, options.config)
        : getStateFromPath(path, options?.config);

      if (state) {
        // for REPLACE action we need to pass only top of navigation state.
        const actionState =
          actionType === 'replace' ? unpackState(state) : state;
        const action = getActionFromState(actionState, options?.config);

        if (isNavigateAction(action)) {
          if (actionType === 'replace' && action.payload.name === route.name) {
            // If replacing and the route name is the same as the current route,
            // update the params instead of pushing the route again skipping animations.
            navigation.setParams(action.payload.params as any);
            return;
          }

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
    [linking, navigation, route]
  );

  return linkTo;
}
