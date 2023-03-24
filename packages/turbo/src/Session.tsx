import { getNativeModule, registerMessageEventListener } from './common';
import React, { RefObject } from 'react';
import type { EmitterSubscription, NativeSyntheticEvent } from 'react-native';
import { SessionContext } from './SessionContext';
import type {
  SessionModule,
  SessionMessageCallback,
  OnErrorCallback,
} from 'packages/turbo/src/types';

const RNSessionModule = getNativeModule<SessionModule>('RNSessionModule');

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
      return RNSessionModule.injectJavaScript(
        this.state.sessionHandle,
        callbackStringified
      );
    }
    return null;
  };

  getNativeComponentHandleId = async () => {
    const { onMessage } = this.props;
    const sessionHandle = await RNSessionModule.registerSession();

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
    RNSessionModule.removeSession(this.state.sessionHandle!);
    this.messageHandlerEventSubscription?.remove();
  }

  onMessage = ({ nativeEvent: { message } }: NativeSyntheticEvent<Message>) => {
    if (this.props.onMessage) {
      this.props.onMessage(message);
    }
  };

  render() {
    const { sessionHandle } = this.state;
    const { onVisitError } = this.props;

    return (
      <SessionContext.Provider value={{ sessionHandle, onVisitError }}>
        {this.props.children}
      </SessionContext.Provider>
    );
  }
}

export function withSession<T>(Component: React.ComponentType<T>) {
  return (props: any) => (
    <Session>
      <Component {...props} />
    </Session>
  );
}
