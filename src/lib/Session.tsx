import React, {RefObject} from 'react';
import {findNodeHandle} from 'react-native';
import {SessionContext} from './SessionContext';
import RNSession from './SessionNativeComponent';

interface Props {}

interface State {
  sessionHandle?: number;
}

class Session extends React.Component<Props, State> {
  // const onSessionCreated = async () => {
  //   await SessionNativeModule.createSession(setSessionHandle);
  // };

  nativeComponentRef: RefObject<typeof RNSession>;

  constructor(props: Props) {
    super(props);
    this.state = {
      sessionHandle: undefined,
    };
    this.nativeComponentRef = React.createRef();
  }

  getNativeComponentHandleId = () => {
    const sessionHandle = findNodeHandle(this.nativeComponentRef.current);
    console.log('native component id', sessionHandle);
    this.setState({
      sessionHandle: sessionHandle || undefined,
    });
  };

  componentDidMount() {
    this.getNativeComponentHandleId();
  }

  render() {
    const {sessionHandle} = this.state;

    return (
      <>
        <RNSession ref={this.nativeComponentRef} />
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
