import {
  LinkingOptions,
  PartialRoute,
  Route,
  getStateFromPath,
} from '@react-navigation/native';

type Options = Parameters<typeof getStateFromPath>[1];

type LinkedParams = { baseURL: string; fullPath: string };

function getParams(
  routes: PartialRoute<Route<string, object | undefined>>[] | undefined
) {
  if (routes?.[0]?.state?.routes) {
    return getParams(routes[0].state.routes);
  }
  return routes?.[0]?.params as LinkedParams | undefined;
}

export function getLinkingObject(
  baseURL: string,
  linking: LinkingOptions<{}>['config']
) {
  return {
    prefixes: [baseURL],
    config: linking,
    getStateFromPath(path: string, options?: Options) {
      const state = getStateFromPath(path, options);
      const params = getParams(state?.routes);
      if (params) {
        params.baseURL = baseURL;
        params.fullPath = path;
      }
      return state;
    },
  };
}
