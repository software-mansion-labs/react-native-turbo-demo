import {
  getActionFromState,
  getStateFromPath,
  NavigationAction,
  NavigationProp,
  PartialState,
  StackActions,
  useNavigation,
  useRoute,
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
import { unpackState } from '../utils/unpackState';

type ActionPayloadParams = {
  screen?: string;
  params?: unknown;
  path?: string;
};

type ActionPayload = {
  params?: ActionPayloadParams;
};

type NavigateAction<State extends NavigationState> = {
  type: 'NAVIGATE';
  payload: {
    name: string;
    params?: NavigatorScreenParams<State>;
    path?: string;
  };
};

type PushAction<State extends NavigationState> = {
  type: 'PUSH';
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

function getKeyFromParams(params: unknown) {
  if (params && typeof params === 'object') {
    if ('fullPath' in params && params.fullPath) {
      return params.fullPath as string;
    } else if ('params' in params) {
      return getKeyFromParams(params.params);
    }
  }
  return undefined;
}

function getAction(
  action: NavigateAction<NavigationState> | PushAction<NavigationState>,
  actionType: Action | undefined,
  routeName: string
) {
  if (actionType === 'replace') {
    if (action.payload.name === routeName && action.payload.params) {
      // If replacing and the route name is the same as the current route,
      // update the params instead of pushing the route again skipping animations.
      return CommonActions.setParams(action.payload.params);
    }
    return StackActions.replace(action.payload.name, action.payload.params);
  } else {
    const { name, params } = action.payload;
    if (action.type === 'NAVIGATE') {
      const key = getKeyFromParams(params);
      return CommonActions.navigate({
        name,
        key,
        params,
      });
    }
    return StackActions.push(name, params);
  }
}

function getMinimalAction(
  action: NavigationAction,
  state: NavigationState
): NavigationAction {
  let currentAction = action;
  let currentState:
    | NavigationState
    | PartialState<NavigationState>
    | undefined = state;

  while (
    currentAction.payload &&
    'name' in currentAction.payload &&
    currentState?.routes[currentState.index ?? -1]?.name ===
      currentAction.payload.name
  ) {
    const payload = currentAction.payload as ActionPayload;

    // Creating new smaller action
    currentAction = {
      // we can still keep the `NAVIGATE` type here, but then we need to use `key` prop later
      type: 'PUSH',
      payload: {
        name: payload?.params?.screen,
        params: payload?.params?.params,
        path: payload?.params?.path,
      },
    };
    currentState = currentState?.routes[currentState.index ?? -1]?.state;
  }
  return currentAction;
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
          let root = navigation;
          let current:
            | NavigationProp<ReactNavigation.RootParamList>
            | undefined;

          while ((current = root.getParent())) {
            root = current;
          }

          const rootState = root.getState();
          const minimalAction = getMinimalAction(action, rootState);
          const actionToDispatch = getAction(
            // @ts-expect-error
            minimalAction,
            actionType,
            route.name
          );
          navigation.dispatch(actionToDispatch);
        } else if (action === undefined) {
          // @ts-expect-error
          navigation.reset(state);
        }
      } else {
        throw new Error('Failed to parse the path to a navigation state.');
      }
    },
    [linking, navigation, route.name]
  );

  return linkTo;
}
