import { LinkingOptions, getStateFromPath } from '@react-navigation/native';

type Options = Parameters<typeof getStateFromPath>[1];

export function getLinkingObject(
  baseURL: string,
  linking: LinkingOptions<{}>['config']
) {
  return {
    prefixes: [baseURL],
    config: linking,
    getStateFromPath(path: string, options?: Options) {
      const state = getStateFromPath(path, options);
      const params = state?.routes[0]?.params as
        | { baseURL: string }
        | undefined;
      if (params) {
        params.baseURL = baseURL;
      }
      return state;
    },
  };
}
