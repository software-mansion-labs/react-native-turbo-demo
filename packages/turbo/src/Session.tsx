import { getNativeModule, registerMessageEventListener } from './common';
import React, { RefObject } from 'react';
import type { EmitterSubscription, NativeSyntheticEvent } from 'react-native';
import type {
  VisitableViewModule,
  SessionMessageCallback,
  OnErrorCallback,
} from 'packages/turbo/src/types';

const deprecationMessage =
  'Session component is no longer supported. Please refer to: https://github.com/software-mansion-labs/react-native-turbo-demo/pull/53#issue-1978014350 and https://github.com/software-mansion-labs/react-native-turbo-demo/blob/main/packages/turbo/README.md for more details.';

const RNVisitableViewModule = getNativeModule<VisitableViewModule>(
  'RNVisitableViewModule'
);

interface Message {
  message: object;
}

export interface Props {
  onMessage?: SessionMessageCallback;
  onVisitError?: OnErrorCallback;
}

interface State {
  sessionHandle?: string | null;
}

export default class Session extends React.Component<Props, State> {
  nativeComponentRef: RefObject<EmitterSubscription>;
  messageHandlerEventSubscription: EmitterSubscription | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      sessionHandle: null,
    };
    this.nativeComponentRef = React.createRef();
  }

  /**
   * Evaluates Javascript code on webview, mind that this function run in the context
   * of webview runtime and doesn't have access to other js functions.
   */
  injectJavaScript = (callbackStringified: string) => {
    if (this.state.sessionHandle) {
      return RNVisitableViewModule.injectJavaScript(
        this.state.sessionHandle,
        callbackStringified
      );
    }
    return null;
  };

  getNativeComponentHandleId = async () => {
    const { onMessage } = this.props;
    const sessionHandle = await RNVisitableViewModule.registerSession();

    if (onMessage) {
      this.messageHandlerEventSubscription = registerMessageEventListener(
        sessionHandle,
        onMessage
      );
    }
    this.setState({
      sessionHandle: sessionHandle || null,
    });
  };

  componentDidMount() {
    this.getNativeComponentHandleId();
  }

  componentWillUnmount() {
    RNVisitableViewModule.removeSession(this.state.sessionHandle!);
    this.messageHandlerEventSubscription?.remove();
  }

  onMessage = ({ nativeEvent: { message } }: NativeSyntheticEvent<Message>) => {
    if (this.props.onMessage) {
      this.props.onMessage(message);
    }
  };

  render() {
    throw new Error(deprecationMessage);
  }
}

export function withSession<T>(_Component: React.ComponentType<T>) {
  throw new Error(deprecationMessage);
}
