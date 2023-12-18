import { LinkingOptions, getStateFromPath } from '@react-navigation/native';

type Options = Parameters<typeof getStateFromPath>[1];

type LinkedParams = { baseURL: string; fullPath: string };

export function getLinkingObject(
  baseURL: string,
  linking: LinkingOptions<{}>['config']
) {
  return {
    prefixes: [baseURL],
    config: linking,
    getStateFromPath(path: string, options?: Options) {
      const state = getStateFromPath(path, options);
      const params = state?.routes[0]?.params as LinkedParams | undefined;
      if (params) {
        params.baseURL = baseURL;
        params.fullPath = path;
      }
      return state;
    },
  };
}
