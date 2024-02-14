import { getStateFromPath } from '@react-navigation/core';

type ResultState = NonNullable<ReturnType<typeof getStateFromPath>>;

export function unpackState(state: ResultState) {
  const nestedState = state?.routes[state.index ?? 0]?.state;
  if (nestedState) {
    return unpackState(nestedState);
  } else {
    return state;
  }
}
