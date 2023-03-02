import React, { useContext, useEffect, useImperativeHandle } from 'react';
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
  onVisitError?: (proposal: NativeSyntheticEvent<VisitProposalError>) => void;
  onMessage?: SessionMessageCallback;
}

export interface RefObject {
  injectJavaScript: (callbackStringified: string) => void;
}

const VisitableView = React.forwardRef<RefObject, React.PropsWithRef<Props>>(
  (props, ref) => {
    const { onMessage, url } = props;
    const messageHandlerEventSubscription = useRef<EmitterSubscription>();
    const { sessionHandle } = useContext(SessionContext);

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

    if (waitingForSession) return null;
    return (
      <RNVisitableView
        {...props}
        key={url} // Makes replace action possible
        sessionHandle={sessionHandle}
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
