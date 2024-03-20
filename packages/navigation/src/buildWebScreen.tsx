import {
  getStateFromPath,
  PartialState,
} from '@react-navigation/native';
import type { NavigationState } from '@react-navigation/core';

import { LinkingConfig } from './hooks/useCurrentUrl';
import { unpackState } from './utils/unpackState';

type Options = Parameters<typeof getStateFromPath>[1];
type LinkedParams = { baseURL?: string; fullPath?: string };

function getParams(
  state: NavigationState | PartialState<NavigationState>
): LinkedParams | undefined {
  const activeRoute = state.routes?.[state.index ?? 0];

  if (activeRoute) {
    if (activeRoute.params) {
      return activeRoute.params;
    } else {
      // route is readonly object (in types). But we need to hack it be non-empty
      // @ts-expect-error
      activeRoute.params = {};
      return activeRoute.params;
    }
  }
  return undefined;
}

export function getLinkingObject(baseURL: string, linking: LinkingConfig) {
  return {
    prefixes: [baseURL],
    config: linking,
    getStateFromPath(path: string, options?: Options) {
      const state = getStateFromPath(path, options);
      if (state) {
        const params = getParams(unpackState(state));
        if (params) {
          params.baseURL = baseURL;
          params.fullPath = path;
        }
      }
      return state;
    },
  };
}
