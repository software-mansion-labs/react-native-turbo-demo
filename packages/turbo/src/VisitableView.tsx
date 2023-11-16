import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  EmitterSubscription,
  NativeSyntheticEvent,
  StyleSheet,
} from 'react-native';
import {
  getNativeComponent,
  getNativeModule,
  registerMessageEventListener,
} from './common';
import type {
  OnErrorCallback,
  OnLoadEvent,
  SessionMessageCallback,
  VisitableViewModule,
  VisitProposal,
  VisitProposalError,
} from './types';

const RNVisitableView = getNativeComponent<any>('RNVisitableView');
const RNVisitableViewModule = getNativeModule<VisitableViewModule>(
  'RNVisitableViewModule'
);

export interface Props {
  url: string;
  sessionHandle?: string;
  onVisitProposal: (proposal: NativeSyntheticEvent<VisitProposal>) => void;
  onLoad?: (proposal: NativeSyntheticEvent<OnLoadEvent>) => void;
  onVisitError?: OnErrorCallback;
  onMessage?: SessionMessageCallback;
}

export interface RefObject {
  injectJavaScript: (callbackStringified: string) => void;
}

const VisitableView = React.forwardRef<RefObject, React.PropsWithRef<Props>>(
  (props, ref) => {
    const {
      sessionHandle = 'Default',
      onMessage,
      onVisitError: viewErrorHandler,
    } = props;
    const messageHandlerEventSubscription = useRef<EmitterSubscription>();

    useEffect(() => {
      const setSessionConfiguration = async () => {
        await RNVisitableViewModule.setConfiguration(sessionHandle);
      };
      setSessionConfiguration();
    }, [sessionHandle]);

    useImperativeHandle(
      ref,
      () => ({
        injectJavaScript: (callbackStringified) => {
          RNVisitableViewModule.injectJavaScript(
            sessionHandle,
            callbackStringified
          );
        },
      }),
      [sessionHandle]
    );

    useEffect(() => {
      if (onMessage) {
        messageHandlerEventSubscription.current?.remove();
        messageHandlerEventSubscription.current = registerMessageEventListener(
          sessionHandle,
          onMessage
        );
      }
    }, [sessionHandle, onMessage]);

    useEffect(() => {
      return () => {
        messageHandlerEventSubscription.current?.remove();
      };
    }, []);

    const handleVisitError = useCallback(
      (e: NativeSyntheticEvent<VisitProposalError>) => {
        viewErrorHandler?.(e.nativeEvent);
      },
      [viewErrorHandler]
    );

    return (
      <RNVisitableView
        {...props}
        sessionHandle={sessionHandle}
        onVisitError={handleVisitError}
        style={styles.container}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VisitableView;
