import {
  NavigationState,
  PartialState,
  useNavigation,
} from '@react-navigation/native';

function unpackState(state: NavigationState | PartialState<NavigationState>) {
  const nestedState = state?.routes[0]?.state;
  if (nestedState) {
    return unpackState(nestedState);
  } else {
    return state;
  }
}

export function useSessionHandle() {
  const navigation = useNavigation();
  const state = unpackState(navigation.getState());
  const routeName = state.routeNames[state.index];
  return routeName;
}
