import { LinkingOptions, useNavigation } from '@react-navigation/native';

export type LinkingConfig = LinkingOptions<{}>['config'];

function findPath(
  name: string | undefined,
  config: LinkingConfig
): string | undefined {
  if (!config || !name) return undefined;
  const screens = config.screens;
  for (const key of Object.keys(screens)) {
    // @ts-expect-error
    const pathOrScreen: string | LinkingConfig = screens[key];
    if (typeof pathOrScreen === 'string') {
      if (key === name) {
        return pathOrScreen;
      }
    } else {
      const path = findPath(name, pathOrScreen);
      if (path) {
        return path;
      }
    }
  }
  return undefined;
}

function getPath(params: unknown) {
  if (params && typeof params === 'object' && 'path' in params) {
    return params.path;
  }
  return undefined;
}

export function useCurrentUrl(baseUrl: string, config: LinkingConfig) {
  const navigation = useNavigation();
  const state = navigation.getState();

  const currentRoute = state.routes[state.index];
  const path =
    getPath(currentRoute?.params) ?? findPath(currentRoute?.name, config) ?? '';

  return `${baseUrl}${path}`;
}
