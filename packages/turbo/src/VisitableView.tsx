import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { NativeSyntheticEvent, StyleSheet } from 'react-native';
import RNVisitableView, { dispatchCommand } from './RNVisitableView';
import type {
  OnErrorCallback,
  LoadEvent,
  SessionMessageCallback,
  VisitProposal,
  VisitProposalError,
  StradaComponent,
  MessageEvent,
} from './types';
import { useStradaBridge } from './stradaBridge';
import {
  NavigationContainerRefContext,
  useNavigation,
} from '@react-navigation/native';

export interface Props {
  url: string;
  sessionHandle?: string;
  applicationNameForUserAgent?: string;
  stradaComponents?: StradaComponent[];
  onVisitProposal: (proposal: VisitProposal) => void;
  onLoad?: (proposal: LoadEvent) => void;
  onVisitError?: OnErrorCallback;
  onMessage?: SessionMessageCallback;
}

export interface RefObject {
  injectJavaScript: (callbackStringified: string) => void;
}

type SessionMessageCallbackArrayElement = SessionMessageCallback | undefined;

function useDisableNavigationAnimation() {
  const navWithRoutes = React.useContext(NavigationContainerRefContext);
  const navigation = useNavigation();

  useEffect(() => {
    const params = navWithRoutes?.getCurrentRoute()?.params;
    if (
      params &&
      '__disable_animation' in params &&
      params.__disable_animation
    ) {
      navigation.setOptions({
        animation: 'none',
      });
      const timeout = setTimeout(() => {
        navigation.setOptions({
          animation: undefined,
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [navigation, navWithRoutes]);
}

const VisitableView = React.forwardRef<RefObject, React.PropsWithRef<Props>>(
  (props, ref) => {
    const {
      url,
      sessionHandle = 'Default',
      applicationNameForUserAgent,
      stradaComponents,
      onLoad,
      onVisitError: viewErrorHandler,
      onMessage: onMessageCallback,
      onVisitProposal,
    } = props;
    const visitableViewRef = useRef<typeof RNVisitableView>();
    const onMessageCallbacks = useRef<SessionMessageCallbackArrayElement[]>([
      onMessageCallback,
    ]);

    const { initializeStradaBridge, stradaUserAgent, sendToBridge } =
      useStradaBridge(visitableViewRef, dispatchCommand, stradaComponents);

    const resolvedApplicationNameForUserAgent = useMemo(
      () =>
        [applicationNameForUserAgent, stradaUserAgent]
          .filter(Boolean)
          .join(' '),
      [applicationNameForUserAgent, stradaUserAgent]
    );
    useDisableNavigationAnimation();

    useImperativeHandle(
      ref,
      () => ({
        injectJavaScript: (callbackStringified) => {
          dispatchCommand(
            visitableViewRef,
            'injectJavaScript',
            callbackStringified
          );
        },
      }),
      []
    );

    const registerMessageListener = useCallback(
      (listener: SessionMessageCallback) => {
        onMessageCallbacks.current.push(listener);
      },
      []
    );

    const handleVisitError = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<VisitProposalError>) => {
        viewErrorHandler?.(nativeEvent);
      },
      [viewErrorHandler]
    );

    const handleOnLoad = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<LoadEvent>) => {
        initializeStradaBridge();
        onLoad?.(nativeEvent);
      },
      [initializeStradaBridge, onLoad]
    );

    const handleOnMessage = useCallback(
      (e: NativeSyntheticEvent<MessageEvent>) => {
        onMessageCallbacks.current.forEach((listener) => {
          listener?.(e.nativeEvent);
        });
      },
      []
    );

    const handleVisitProposal = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<VisitProposal>) => {
        onVisitProposal(nativeEvent);
      },
      [onVisitProposal]
    );

    return (
      <>
        {stradaComponents?.map((Component, i) => (
          <Component
            key={i}
            url={url}
            sessionHandle={sessionHandle}
            name={Component.componentName}
            registerMessageListener={registerMessageListener}
            sendToBridge={sendToBridge}
          />
        ))}
        <RNVisitableView
          // @ts-expect-error
          ref={visitableViewRef}
          url={props.url}
          sessionHandle={sessionHandle}
          applicationNameForUserAgent={resolvedApplicationNameForUserAgent}
          onVisitProposal={handleVisitProposal}
          onMessage={handleOnMessage}
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
