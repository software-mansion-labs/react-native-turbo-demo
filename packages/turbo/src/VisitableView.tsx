import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useMemo,
} from 'react';
import {
  EmitterSubscription,
  NativeSyntheticEvent,
  StyleSheet,
} from 'react-native';
import { getNativeModule, registerMessageEventListener } from './common';
import type {
  OnErrorCallback,
  OnLoadEvent,
  SessionMessageCallback,
  VisitableViewModule,
  VisitProposal,
  VisitProposalError,
  StradaComponent,
} from './types';
import { useStradaBridge } from './stradaBridge';
import RNVisitableView from './RNVisitableView';

const RNVisitableViewModule = getNativeModule<VisitableViewModule>(
  'RNVisitableViewModule'
);

export interface Props {
  url: string;
  sessionHandle?: string;
  applicationNameForUserAgent?: string;
  stradaComponents?: StradaComponent[];
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
      url,
      sessionHandle = 'Default',
      applicationNameForUserAgent,
      onMessage,
      stradaComponents,
      onVisitError: viewErrorHandler,
      onLoad,
    } = props;
    const messageHandlerEventSubscription = useRef<EmitterSubscription>();
    const { initializeStradaBridge, stradaUserAgent } = useStradaBridge(
      sessionHandle,
      stradaComponents
    );

    const resolvedApplicationNameForUserAgent = useMemo(
      () =>
        [applicationNameForUserAgent, stradaUserAgent]
          .filter(Boolean)
          .join(' '),
      [applicationNameForUserAgent, stradaUserAgent]
    );

    useEffect(() => {
      const setSessionConfiguration = async () => {
        await RNVisitableViewModule.setConfiguration(
          sessionHandle,
          resolvedApplicationNameForUserAgent
        );
      };
      setSessionConfiguration();
    }, [sessionHandle, resolvedApplicationNameForUserAgent]);

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
          `sessionMessage${sessionHandle}`,
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

    const handleOnLoad = useCallback(
      (e: NativeSyntheticEvent<OnLoadEvent>) => {
        initializeStradaBridge();
        onLoad?.(e);
      },
      [initializeStradaBridge, onLoad]
    );

    return (
      <>
        {stradaComponents?.map((Component, i) => (
          <Component
            key={i}
            sessionHandle={sessionHandle}
            name={Component.componentName}
            url={url}
          />
        ))}
        <RNVisitableView
          {...props}
          sessionHandle={sessionHandle}
          onVisitError={handleVisitError}
          onLoad={handleOnLoad}
          style={styles.container}
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VisitableView;
