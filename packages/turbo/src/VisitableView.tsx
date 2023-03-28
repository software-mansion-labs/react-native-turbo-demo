import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
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
  SessionModule,
  VisitProposal,
  VisitProposalError,
} from './types';
import { SessionContext } from './SessionContext';
import { useRef } from 'react';

const RNVisitableView = getNativeComponent<any>('RNVisitableView');
const RNSessionModule = getNativeModule<SessionModule>('RNSessionModule');

export interface Props {
  url: string;
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
    const { onMessage, onVisitError: viewErrorHandler } = props;
    const messageHandlerEventSubscription = useRef<EmitterSubscription>();
    const { sessionHandle, onVisitError: sessionErrorHandler } =
      useContext(SessionContext);

    const waitingForSession = sessionHandle === null;

    useImperativeHandle(
      ref,
      () => ({
        injectJavaScript: (callbackStringified) => {
          RNSessionModule.injectJavaScript(
            sessionHandle || null,
            callbackStringified
          );
        },
      }),
      [sessionHandle]
    );

    useEffect(() => {
      if (onMessage && !waitingForSession) {
        messageHandlerEventSubscription.current?.remove();
        messageHandlerEventSubscription.current = registerMessageEventListener(
          sessionHandle || 'Default',
          onMessage
        );
      }
    }, [sessionHandle, onMessage, waitingForSession]);

    useEffect(() => {
      return () => {
        messageHandlerEventSubscription.current?.remove();
      };
    }, []);

    const handleVisitError = useCallback(
      (e: NativeSyntheticEvent<VisitProposalError>) => {
        sessionErrorHandler?.(e.nativeEvent);
        viewErrorHandler?.(e.nativeEvent);
      },
      [sessionErrorHandler, viewErrorHandler]
    );

    if (waitingForSession) return null;
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
