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
import { isDeepEqual } from '../utils/isEqual';

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

function getMinimalAction(
  action: NavigationAction,
  state: NavigationState
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
    isDeepEqual(
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

// This object is dynamically filled while navigating
const modalScreens = new Set<string>();

/*
 * Its like useLinkTo with some custom tweaks
 */
export function useWebviewNavigate<
  ParamList extends ReactNavigation.RootParamList
>(navigationRef) {
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
        const action = getActionFromState(state, options?.config);

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

          console.log(
            action.payload.name,
            rootState.routes[rootState.index ?? -1].name
          );

          console.log('before', JSON.stringify(root.getState(), null, 2));

          /*
            This if clauses causes root navigator to contain only two routes in its state.
            Every time we navigate to another "direct root child" we pop the old child and push the new one (it is done automatically).

            Do we need this route in routes array? If we navigate to another "direct root child" then if we would like to go back to the previous child we still need to modify the old "direct root child", it will be handled by actionToDispatch.
            Then we don't need the old child.
            The only exception is the Fallback route, it is a route that is used when we don't have any other route to navigate to. It is a route that is always present in the routes array.
            Otherwise we end up removing previous "stack of screens" and the go back button no longer works properly.

            This approach should work if we define separate stacks for each "direct root child" in the root navigator.
          */
          // if (
          //   action.payload.name !== 'Fallback' &&
          //   action.payload.name !== rootState.routes[rootState.index ?? -1].name
          // ) {
          //   root.popToTop();
          // }

          const currentScreenName =
            rootState.routes[rootState.index ?? -1].name;

          // This approach is a little bit different than the one above, but it feels more generic and only executes when the user is in a stack where a modal screen has occured.
          // This check might be removed if we introduce custom Navigator components
          // We would need to add a custom property to navigation object (it is possible, but from typescript side it might be not)
          if (navigationRef?.getCurrentOptions()?.presentation === 'modal') {
            modalScreens.add(currentScreenName);
          }

          if (
            action.payload.name !== currentScreenName &&
            modalScreens.has(currentScreenName)
          ) {
            root.popToTop();
          }

          navigation.dispatch(actionToDispatch);

          console.log('after', JSON.stringify(root.getState(), null, 2));
        } else if (action === undefined) {
          // @ts-expect-error
          navigation.reset(state);
        }
      } else {
        throw new Error('Failed to parse the path to a navigation state.');
      }
    },
    [linking, navigation, navigationRef, route.name]
  );

  return linkTo;
}
