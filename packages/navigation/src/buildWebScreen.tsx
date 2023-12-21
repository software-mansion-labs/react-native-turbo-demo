import {
  PartialRoute,
  Route,
  getStateFromPath,
} from '@react-navigation/native';
import { unpackState } from './utils/unpackState';
import { LinkingConfig } from './hooks/useCurrentUrl';

type Options = Parameters<typeof getStateFromPath>[1];
type LinkedParams = { baseURL?: string; fullPath?: string };
type PartialRoutes = ReadonlyArray<
  PartialRoute<Route<string, object | undefined>>
>;

function getParams(
  routes: PartialRoutes | undefined
): LinkedParams | undefined {
  const firstRoute = routes?.[0];
  if (firstRoute) {
    if (firstRoute.params) {
      return firstRoute.params;
    } else {
      // route is readonly object (in types). But we need to hack it be non-empty
      // @ts-expect-error
      firstRoute.params = {};
      return firstRoute.params;
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
        const params = getParams(unpackState(state)?.routes);
        if (params) {
          params.baseURL = baseURL;
          params.fullPath = path;
        }
      }
      return state;
    },
  };
}
