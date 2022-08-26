import React, {RefObject} from 'react';
import {findNodeHandle, NativeSyntheticEvent} from 'react-native';
import {SessionContext} from './SessionContext';
import RNSession from './SessionNativeComponent';

interface Message {
  message: object;
}

interface Props {
  onMessage?: (message: object) => void;
}

interface State {
  sessionHandle?: number | null;
}

class Session extends React.Component<Props, State> {
  // const onSessionCreated = async () => {
  //   await SessionNativeModule.createSession(setSessionHandle);
  // };

  nativeComponentRef: RefObject<typeof RNSession>;

  constructor(props: Props) {
    super(props);
    this.state = {
      sessionHandle: null,
    };
    this.nativeComponentRef = React.createRef(null);
  }

  getNativeComponentHandleId = () => {
    const sessionHandle = findNodeHandle(this.nativeComponentRef.current);
    this.setState({
      sessionHandle: sessionHandle || null,
    });
  };

  componentDidMount() {
    this.getNativeComponentHandleId();
  }

  onMessage = ({nativeEvent: {message}}: NativeSyntheticEvent<Message>) => {
    if (this.props.onMessage) {
      this.props.onMessage(message);
    }
  };

  render() {
    const {sessionHandle} = this.state;

    return (
      <>
        <RNSession ref={this.nativeComponentRef} onMessage={this.onMessage} />
        <SessionContext.Provider value={{sessionHandle}}>
          {this.props.children}
        </SessionContext.Provider>
      </>
    );
  }
}

export function withSession<T>(Component: React.ComponentType<T>) {
  return (props: T) => (
    <Session>
      <Component {...props} />
    </Session>
  );
}

export default Session;
