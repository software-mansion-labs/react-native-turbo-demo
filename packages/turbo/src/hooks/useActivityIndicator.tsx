import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';

export type RenderLoading = () => React.ReactNode;

const defaultRenderLoading = () => (
  <View style={styles.wrapper}>
    <ActivityIndicator
      size={Platform.select({
        ios: 'small',
        android: 'large',
      })}
    />
  </View>
);

export function useActivityIndicator(renderLoading?: RenderLoading) {
  const [isVisible, setIsVisible] = React.useState(false);

  const activityIndicator = useMemo(() => {
    const activityIndicatorComponent = (
      renderLoading || defaultRenderLoading
    )();
    return isVisible && <>{activityIndicatorComponent}</>;
  }, [isVisible, renderLoading]);

  const handleShowActivityIndicator = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleHideActivityIndicator = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    activityIndicator,
    handleShowActivityIndicator,
    handleHideActivityIndicator,
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
    zIndex: 1,
  },
});
