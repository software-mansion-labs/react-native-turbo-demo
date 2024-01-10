import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';

export type RenderLoading = () => React.ReactNode;

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

export function useRenderLoading(renderLoading?: RenderLoading) {
  const [isVisible, setIsVisible] = React.useState(false);

  const loadingComponent = useMemo(() => {
    const component = (renderLoading || defaultRenderLoading)();
    return isVisible && <>{component}</>;
  }, [isVisible, renderLoading]);

  const handleShowLoading = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleHideLoading = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    loadingComponent,
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
