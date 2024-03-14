import React from 'react';

import type { OnErrorCallback, SessionMessageCallback } from './types';

const deprecationMessage =
  'Session component is no longer supported. Please refer to: https://github.com/software-mansion-labs/react-native-turbo-demo/pull/53#issue-1978014350 and https://github.com/software-mansion-labs/react-native-turbo-demo/blob/main/packages/turbo/README.md for more details.';

export interface Props {
  onMessage?: SessionMessageCallback;
  onError?: OnErrorCallback;
}

interface State {
  sessionHandle?: string | null;
}

export default class Session extends React.Component<Props, State> {
  // @ts-ignore
  render() {
    throw new Error(deprecationMessage);
  }
}

export function withSession<T>(_Component: React.ComponentType<T>) {
  throw new Error(deprecationMessage);
}
