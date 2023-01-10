import { getNativeModule } from './common';
import React, { RefObject } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { SessionContext } from './SessionContext';

const RNSessionModule = getNativeModule('RNSessionModule');

interface Message {
  message: object;
}

export interface Props {
  onMessage?: (message: object) => void;
}

interface State {
  sessionHandle?: number | null;
}

export default class Session extends React.Component<Props, State> {
  // const onSessionCreated = async () => {
  //   await SessionNativeModule.createSession(setSessionHandle);
  // };

  nativeComponentRef: RefObject<any>;

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
  injectJavaScript = async (jsCallback: Function | string) => {
    const isString =
      typeof jsCallback === 'string' || jsCallback instanceof String;

    const callbackStringified = isString
      ? jsCallback
      : `(${jsCallback.toString()})()`;

    return RNSessionModule.injectJavaScript(
      this.state.sessionHandle,
      callbackStringified
    );
  };

  getNativeComponentHandleId = async () => {
    const sessionHandle = await RNSessionModule.registerSession();
    this.setState({
      sessionHandle: sessionHandle || null,
    });
  };

  componentDidMount() {
    this.getNativeComponentHandleId();
  }

  componentWillUnmount() {
    RNSessionModule.removeSession(this.state.sessionHandle);
  }

  onMessage = ({ nativeEvent: { message } }: NativeSyntheticEvent<Message>) => {
    if (this.props.onMessage) {
      this.props.onMessage(message);
    }
  };

  render() {
    const { sessionHandle } = this.state;

    return (
      <SessionContext.Provider value={{ sessionHandle }}>
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
