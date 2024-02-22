import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useMemo,
  Component,
} from 'react';
import { NativeMethods, NativeSyntheticEvent, StyleSheet } from 'react-native';
import RNVisitableView, {
  RNVisitableViewProps,
  dispatchCommand,
  openExternalURL,
} from './RNVisitableView';
import type {
  OnErrorCallback,
  LoadEvent,
  SessionMessageCallback,
  VisitProposal,
  ErrorEvent,
  OpenExternalUrlEvent,
  StradaComponent,
  FormSubmissionEvent,
  ContentProcessDidTerminateEvent,
} from './types';
import { useStradaBridge } from './hooks/useStradaBridge';
import { useMessageQueue } from './hooks/useMessageQueue';
import {
  type OnAlert,
  type OnConfirm,
  useWebViewDialogs,
} from './hooks/useWebViewDialogs';
import {
  type RenderLoading,
  type RenderError,
  useWebViewState,
} from './hooks/useWebViewState';

export interface Props {
  url: string;
  sessionHandle?: string;
  applicationNameForUserAgent?: string;
  stradaComponents?: StradaComponent[];
  pullToRefreshEnabled?: boolean;
  renderLoading?: RenderLoading;
  renderError?: RenderError;
  onVisitProposal: (proposal: VisitProposal) => void;
  onLoad?: (params: LoadEvent) => void;
  onOpenExternalUrl?: (proposal: OpenExternalUrlEvent) => void;
  onFormSubmissionStarted?: (e: FormSubmissionEvent) => void;
  onFormSubmissionFinished?: (e: FormSubmissionEvent) => void;
  onContentProcessDidTerminate?: (e: ContentProcessDidTerminateEvent) => void;
  onError?: OnErrorCallback;
  onMessage?: SessionMessageCallback;
  onAlert?: OnAlert;
  onConfirm?: OnConfirm;
}

export interface RefObject {
  injectJavaScript: (callbackStringified: string) => void;
  reload: () => void;
  refresh: () => void;
}

const VisitableView = React.forwardRef<RefObject, React.PropsWithRef<Props>>(
  (props, ref) => {
    const {
      url,
      sessionHandle = 'Default',
      applicationNameForUserAgent,
      stradaComponents,
      pullToRefreshEnabled = true,
      renderLoading,
      renderError,
      onLoad,
      onError: onErrorCustomHandler,
      onMessage,
      onVisitProposal,
      onOpenExternalUrl: onOpenExternalUrlCallback = openExternalURL,
      onAlert,
      onConfirm,
      onFormSubmissionStarted,
      onFormSubmissionFinished,
      onContentProcessDidTerminate,
    } = props;
    const visitableViewRef = useRef<
      Component<RNVisitableViewProps> & NativeMethods
    >(null);

    const { registerMessageListener, handleOnMessage } =
      useMessageQueue(onMessage);

    const { initializeStradaBridge, stradaUserAgent, sendToBridge } =
      useStradaBridge(visitableViewRef, dispatchCommand, stradaComponents);

    const reloadVisitableView = useCallback(() => {
      dispatchCommand(visitableViewRef, 'reload');
    }, []);

    const {
      webViewStateComponent,
      handleShowLoading,
      handleHideLoading,
      handleRenderError,
    } = useWebViewState(reloadVisitableView, renderLoading, renderError);

    const resolvedApplicationNameForUserAgent = useMemo(
      () =>
        [applicationNameForUserAgent, stradaUserAgent]
          .filter(Boolean)
          .join(' '),
      [applicationNameForUserAgent, stradaUserAgent]
    );

    useImperativeHandle(
      ref,
      () => ({
        injectJavaScript: (callbackStringified) =>
          dispatchCommand(
            visitableViewRef,
            'injectJavaScript',
            callbackStringified
          ),
        reload: reloadVisitableView,
        refresh: () => dispatchCommand(visitableViewRef, 'refresh'),
      }),
      [reloadVisitableView]
    );

    const onErrorCombinedHandlers = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<ErrorEvent>) => {
        onErrorCustomHandler?.(nativeEvent);
        handleRenderError(nativeEvent);
      },
      [handleRenderError, onErrorCustomHandler]
    );

    const handleOnLoad = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<LoadEvent>) => {
        initializeStradaBridge();
        onLoad?.(nativeEvent);
      },
      [initializeStradaBridge, onLoad]
    );

    const handleVisitProposal = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<VisitProposal>) => {
        // Using requestAnimationFrame helps prevent a potential race condition
        // that might occur between onFormSubmissionFinished and onVisitProposal.
        requestAnimationFrame(() => onVisitProposal(nativeEvent));
      },
      [onVisitProposal]
    );

    const handleOnOpenExternalUrl = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<OpenExternalUrlEvent>) =>
        onOpenExternalUrlCallback(nativeEvent),
      [onOpenExternalUrlCallback]
    );

    const handleOnFormSubmissionStarted = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<FormSubmissionEvent>) => {
        onFormSubmissionStarted?.(nativeEvent);
      },
      [onFormSubmissionStarted]
    );

    const handleOnFormSubmissionFinished = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<FormSubmissionEvent>) => {
        onFormSubmissionFinished?.(nativeEvent);
      },
      [onFormSubmissionFinished]
    );

    const { handleAlert, handleConfirm } = useWebViewDialogs(
      visitableViewRef,
      onAlert,
      onConfirm
    );

    const handleOnContentProcessDidTerminate = useCallback(
      ({
        nativeEvent,
      }: NativeSyntheticEvent<ContentProcessDidTerminateEvent>) => {
        if (!onContentProcessDidTerminate) {
          dispatchCommand(visitableViewRef, 'reload');
          return;
        }
        onContentProcessDidTerminate(nativeEvent);
      },
      [onContentProcessDidTerminate]
    );

    return (
      <>
        {webViewStateComponent}
        {stradaComponents?.map((StradaComponent, i) => (
          <StradaComponent
            key={`${url}-${i}`}
            url={url}
            sessionHandle={sessionHandle}
            name={StradaComponent.componentName}
            registerMessageListener={registerMessageListener}
            sendToBridge={sendToBridge}
          />
        ))}
        <RNVisitableView
          ref={visitableViewRef}
          url={props.url}
          sessionHandle={sessionHandle}
          applicationNameForUserAgent={resolvedApplicationNameForUserAgent}
          pullToRefreshEnabled={pullToRefreshEnabled}
          onError={onErrorCombinedHandlers}
          onVisitProposal={handleVisitProposal}
          onMessage={handleOnMessage}
          onOpenExternalUrl={handleOnOpenExternalUrl}
          onLoad={handleOnLoad}
          style={styles.container}
          onWebAlert={handleAlert}
          onWebConfirm={handleConfirm}
          onFormSubmissionStarted={handleOnFormSubmissionStarted}
          onFormSubmissionFinished={handleOnFormSubmissionFinished}
          onShowLoading={handleShowLoading}
          onHideLoading={handleHideLoading}
          onContentProcessDidTerminate={handleOnContentProcessDidTerminate}
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
