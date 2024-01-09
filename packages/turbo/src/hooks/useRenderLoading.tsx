import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';

export type RenderLoading = () => React.ReactNode;

const SIZE = Platform.select({
  ios: 'small',
  android: 'large',
});

const defaultRenderLoading = () => (
  <View style={styles.wrapper}>
    <ActivityIndicator size={SIZE} />
  </View>
);

export function useRenderLoading(renderLoading?: RenderLoading) {
  const [isVisible, setIsVisible] = React.useState(false);

  const activityIndicator = useMemo(() => {
    const activityIndicatorComponent = (
      renderLoading || defaultRenderLoading
    )();
    return isVisible && <>{activityIndicatorComponent}</>;
  }, [isVisible, renderLoading]);

  const handleShowLoading = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleHideLoading = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    activityIndicator,
    handleShowLoading,
    handleHideLoading,
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
