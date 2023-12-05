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
  StradaComponent,
} from './types';
import { useStradaBridge } from './stradaBridge';
import {
  NavigationContainerRefContext,
  useNavigation,
} from '@react-navigation/native';

const RNVisitableView = getNativeComponent<any>('RNVisitableView');
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
    useDisableNavigationAnimation();

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
