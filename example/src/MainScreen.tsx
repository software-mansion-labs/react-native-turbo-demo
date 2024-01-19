import React, { useCallback, useState } from 'react';
import WebView, { type Props } from './WebView';
import type { OnErrorCallback, RenderError } from 'react-native-turbo';
import { Routes } from './webScreenRoutes';

const MainScreen: React.FC<Props> = (props) => {
  const [renderError, setRenderError] = useState<RenderError | undefined>(
    () => () => null
  );

  const onError: OnErrorCallback = useCallback(
    (error) => {
      const notLoggedIn = error.statusCode === 401;
      if (notLoggedIn) {
        props.navigation.navigate(Routes.SignIn, { path: 'signin' });
      } else {
        setRenderError(undefined);
      }
    },
    [props.navigation]
  );

  return <WebView {...props} onError={onError} renderError={renderError} />;
};

export default MainScreen;
