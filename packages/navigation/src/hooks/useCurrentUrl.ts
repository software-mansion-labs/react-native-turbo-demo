import { useNavigation } from '@react-navigation/native';

export function useCurrentUrl(defaultBaseUrl?: string) {
  const navigation = useNavigation();
  const state = navigation.getState();

  const currentRoute = state.routes[state.index];
  const params = currentRoute?.params as
    | { path?: string; baseURL?: string }
    | undefined;

  const path = params?.path ?? '';
  const baseURL = params?.baseURL ?? defaultBaseUrl ?? '';

  return `${baseURL}${path}`;
}
