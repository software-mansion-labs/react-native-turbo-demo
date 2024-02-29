import React, { useCallback, useMemo, useState } from 'react';
import {
  Text,
  Button,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { ErrorEvent } from '../types';

export type RenderLoading = () => React.ReactNode;
export type RenderError = (
  error: ErrorEvent,
  reloadHandler: () => void
) => React.ReactNode;

type ActivityIndicatorSize = 'small' | 'large';

const SIZE: ActivityIndicatorSize = Platform.select({
  ios: 'small',
  android: 'large',
})!;

const defaultRenderLoading = () => (
  <View style={styles.wrapper}>
    <ActivityIndicator size={SIZE} />
  </View>
);

const defaultRenderError = (
  { description = 'Something went wrong...' }: ErrorEvent,
  reloadHandler: () => void
) => (
  <View style={styles.wrapper}>
    <Text style={styles.title}>Error loading page</Text>
    <Text style={styles.description}>{description}</Text>
    <Button title="Retry" onPress={reloadHandler} />
  </View>
);

export function useWebViewState(
  reloadHandler: () => void,
  renderLoading?: RenderLoading,
  renderError?: RenderError
) {
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [error, setError] = useState<ErrorEvent>({} as ErrorEvent);

  const webViewStateComponent = useMemo(() => {
    const loadingComponent = (renderLoading || defaultRenderLoading)();
    const errorComponent = (renderError || defaultRenderError)(
      error,
      reloadHandler
    );

    return (
      <>
        {loadingVisible && loadingComponent}
        {errorVisible && errorComponent}
      </>
    );
  }, [
    error,
    errorVisible,
    loadingVisible,
    reloadHandler,
    renderError,
    renderLoading,
  ]);

  const handleShowLoading = useCallback(() => {
    setErrorVisible(false);
    setLoadingVisible(true);
  }, []);

  const handleHideLoading = useCallback(() => {
    setLoadingVisible(false);
  }, []);

  const handleRenderError = useCallback((errorEvent: ErrorEvent) => {
    setErrorVisible(true);
    setError(errorEvent);
  }, []);

  return {
    webViewStateComponent,
    handleShowLoading,
    handleHideLoading,
    handleRenderError,
  };
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  title: {
    fontSize: 36,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    maxWidth: '85%',
    textAlign: 'center',
  },
});
