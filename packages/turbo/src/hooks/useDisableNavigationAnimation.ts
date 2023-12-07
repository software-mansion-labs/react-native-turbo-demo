import React, { useEffect } from 'react';
import {
  NavigationContainerRefContext,
  useNavigation,
} from '@react-navigation/native';

export function useDisableNavigationAnimation() {
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
