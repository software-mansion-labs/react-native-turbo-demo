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
  VisitProposalError,
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

export interface Props {
  url: string;
  sessionHandle?: string;
  applicationNameForUserAgent?: string;
  stradaComponents?: StradaComponent[];
  pullToRefreshEnabled?: boolean;
  renderLoading?: RenderLoading;
  onVisitProposal: (proposal: VisitProposal) => void;
  onLoad?: (params: LoadEvent) => void;
  onOpenExternalUrl?: (proposal: OpenExternalUrlEvent) => void;
  onFormSubmissionStarted?: (e: FormSubmissionEvent) => void;
  onFormSubmissionFinished?: (e: FormSubmissionEvent) => void;
  onContentProcessDidTerminate?: (e: ContentProcessDidTerminateEvent) => void;
  onVisitError?: OnErrorCallback;
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
      onLoad,
      onVisitError: viewErrorHandler,
      onMessage,
      onVisitProposal,
      onOpenExternalUrl: onOpenExternalUrlCallback = openExternalURL,
      onAlert,
      onConfirm,
      onFormSubmissionStarted,
      onFormSubmissionFinished,
      pullToRefreshEnabled = true,
      renderLoading,
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

    useImperativeHandle(
      ref,
      () => ({
        injectJavaScript: (callbackStringified) =>
          dispatchCommand(
            visitableViewRef,
            'injectJavaScript',
            callbackStringified
          ),
        reload: () => dispatchCommand(visitableViewRef, 'reload'),
      }),
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

    const { loadingComponent, handleShowLoading, handleHideLoading } =
      useRenderLoading(renderLoading);

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
          onVisitProposal={handleVisitProposal}
          onMessage={handleOnMessage}
          onVisitError={handleVisitError}
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
