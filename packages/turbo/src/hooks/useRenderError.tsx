import React, { useCallback, useMemo } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import type { ErrorEvent } from '../types';

export type RenderError = () => React.ReactNode;

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

export function useRenderError(
  reloadHandler: () => void,
  renderError?: RenderError
) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [error, setError] = React.useState<ErrorEvent>({} as ErrorEvent);

  const errorComponent = useMemo(() => {
    const component = (renderError || defaultRenderError)(error, reloadHandler);
    return isVisible && <>{component}</>;
  }, [renderError, error, reloadHandler, isVisible]);

  const handleRenderError = useCallback((errorEvent: ErrorEvent) => {
    setIsVisible(true);
    setError(errorEvent);
  }, []);

  const hideErrorComponent = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    errorComponent,
    handleRenderError,
    hideErrorComponent,
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
    backgroundColor: 'white',
    zIndex: 2,
  },
  title: {
    fontSize: 36,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
});
