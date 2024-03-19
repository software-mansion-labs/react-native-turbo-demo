import type {
  NavigationState,
  NavigatorScreenParams,
} from '@react-navigation/core';
import {
  getActionFromState,
  getStateFromPath,
  NavigationAction,
  NavigationProp,
  PartialState,
  StackActions,
  useNavigation,
  useRoute,
  CommonActions,
} from '@react-navigation/native';
import LinkingContext from '@react-navigation/native/src/LinkingContext';
import extractPathFromURL from '@react-navigation/native/src/extractPathFromURL';
import * as React from 'react';
import type { Action } from 'react-native-turbo';

import { isDeepEqual, type ComparableObject } from '../utils/isEqual';

type ActionPayloadParams = {
  screen?: string;
  params?: unknown;
  path?: string;
};

type ActionPayload = {
  params?: ActionPayloadParams;
  name?: string;
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
  ParamList extends
    ReactNavigation.RootParamList = ReactNavigation.RootParamList,
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

function isNavigateAction(
  action: ReturnType<typeof getActionFromState>
): action is NavigateAction<NavigationState> {
  return !!action && action.type === 'NAVIGATE';
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
      return CommonActions.navigate({
        name,
        params,
      });
    }
    return StackActions.push(name, params);
  }
}

function areParamsSimilarForActionType(
  actionType: Action | undefined,
  existingParams: ComparableObject,
  newParams: ComparableObject
) {
  let ignoredParams = {
    path: undefined,
    params: undefined,
  } as object;

  if (actionType === 'replace') {
    ignoredParams = {
      ...ignoredParams,
      screen: undefined,
    };
  }

  const existingSignificantParams = { ...existingParams, ...ignoredParams };
  const newSignificantParams = { ...newParams, ...ignoredParams };

  return isDeepEqual(existingSignificantParams, newSignificantParams);
}

function getMinimalAction(
  action: NavigationAction,
  state: NavigationState,
  actionType: Action | undefined
): NavigationAction {
  let currentAction = action;
  let currentState:
    | NavigationState
    | PartialState<NavigationState>
    | undefined = state;
  let payload = currentAction.payload as ActionPayload | undefined;

  while (
    payload &&
    payload?.name &&
    payload?.params?.screen &&
    currentState?.routes[currentState.index ?? -1]?.name === payload.name &&
    areParamsSimilarForActionType(
      actionType,
      currentState?.routes[currentState.index ?? -1]?.params,
      payload.params
    )
  ) {
    // Creating new smaller action
    currentAction = {
      // We can still keep the `NAVIGATE` type here, but then we need to use `key` prop later
      type: 'NAVIGATE',
      payload: {
        name: payload?.params?.screen,
        params: payload?.params?.params,
        path: payload?.params?.path,
      },
    };
    currentState = currentState?.routes[currentState.index ?? -1]?.state;
    payload = currentAction.payload;
  }
  return currentAction;
}

type DispatchUtilities = {
  state: NavigationState | PartialState<NavigationState> | undefined;
  actionToDispatch: ReturnType<typeof getAction> | undefined;
  willChangeTopmostNavigator: boolean | undefined;
  rootNavigator: NavigationProp<ReactNavigation.RootParamList>;
};

/*
 * Its like useLinkTo with some custom tweaks
 */
export function useWebviewNavigate<
  ParamList extends ReactNavigation.RootParamList,
>() {
  const navigation = useNavigation();
  const linking = React.useContext(LinkingContext);
  const route = useRoute();

  const getDispatchUtilities = React.useCallback(
    (to: To<ParamList>, actionType?: Action): DispatchUtilities => {
      if (navigation === undefined) {
        throw new Error(
          "Couldn't find a navigation object. Is your component inside NavigationContainer?"
        );
      }

      let actionToDispatch;
      let willChangeTopmostNavigator = false;
      let root = navigation;
      while (root.getParent()) {
        root = root.getParent();
      }

      if (to && typeof to !== 'string') {
        return {
          // @ts-expect-error
          actionToDispatch: CommonActions.navigate({
            name: to.screen,
            params: to.params,
          }),
          // @ts-expect-error
          rootNavigator: root,
          state: undefined,
          willChangeTopmostNavigator,
        };
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
        const action = getActionFromState(state, options?.config);

        if (isNavigateAction(action)) {
          const rootState = root.getState();
          // @ts-expect-error
          const minimalAction = getMinimalAction(action, rootState, actionType);
          const currentScreenName =
            rootState?.routes[rootState.index ?? -1]?.name;

          if (
            currentScreenName &&
            action.payload.name !== currentScreenName &&
            navigation.canGoBack()
          ) {
            willChangeTopmostNavigator = true;
          }

          actionToDispatch = getAction(
            // @ts-expect-error
            minimalAction,
            actionType,
            route.name
          );
        }
      }

      return {
        actionToDispatch,
        // @ts-expect-error
        rootNavigator: root,
        state,
        willChangeTopmostNavigator,
      };
    },
    [linking, navigation, route.name]
  );

  const navigateTo = React.useCallback(
    (to: To<ParamList>, actionType?: Action) => {
      const { actionToDispatch, state } = getDispatchUtilities(to, actionType);

      if (actionToDispatch) {
        navigation.dispatch(actionToDispatch);
        return;
      }

      if (!state) {
        throw new Error('Failed to parse the path to a navigation state.');
      }

      // @ts-expect-error
      navigation.reset(state);
    },
    [getDispatchUtilities, navigation]
  );

  return { navigateTo, getDispatchUtilities };
}
