import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useMemo,
} from 'react';
import { NativeSyntheticEvent, StyleSheet } from 'react-native';
import RNVisitableView, {
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
import { type RenderLoading, useRenderLoading } from './hooks/useRenderLoading';
import { type RenderError, useRenderError } from './hooks/useRenderError';

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
      onError: viewErrorHandler,
      onMessage,
      onVisitProposal,
      onOpenExternalUrl: onOpenExternalUrlCallback = openExternalURL,
      onAlert,
      onConfirm,
      onFormSubmissionStarted,
      onFormSubmissionFinished,
      onContentProcessDidTerminate,
    } = props;
    const visitableViewRef = useRef<typeof RNVisitableView>();

    const { registerMessageListener, handleOnMessage } =
      useMessageQueue(onMessage);

    const { initializeStradaBridge, stradaUserAgent, sendToBridge } =
      useStradaBridge(visitableViewRef, dispatchCommand, stradaComponents);

    const resolvedApplicationNameForUserAgent = useMemo(
      () =>
        [applicationNameForUserAgent, stradaUserAgent]
          .filter(Boolean)
          .join(' '),
      [applicationNameForUserAgent, stradaUserAgent]
    );

    const reloadVisitableView = useCallback(() => {
      dispatchCommand(visitableViewRef, 'reload');
    }, []);

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
      }),
      [reloadVisitableView]
    );

    const { errorComponent, handleRenderError, hideErrorComponent } =
      useRenderError(reloadVisitableView, renderError);

    const handleOnError = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<ErrorEvent>) => {
        viewErrorHandler?.(nativeEvent);
        handleRenderError(nativeEvent);
      },
      [handleRenderError, viewErrorHandler]
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
        onVisitProposal(nativeEvent);
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

    const {
      loadingComponent,
      handleShowLoading: handleShowLoadingCallback,
      handleHideLoading,
    } = useRenderLoading(renderLoading);

    const handleShowLoading = useCallback(() => {
      hideErrorComponent();
      handleShowLoadingCallback();
    }, [handleShowLoadingCallback, hideErrorComponent]);

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
        {errorComponent}
        {loadingComponent}
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
          pullToRefreshEnabled={pullToRefreshEnabled}
          onError={handleOnError}
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
