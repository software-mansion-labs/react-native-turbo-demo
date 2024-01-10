import React, { useCallback } from 'react';
import WebView, { type Props } from './WebView';

const MainScreen: React.FC<Props> = (props) => {
  const renderError = useCallback(() => null, []);
  return <WebView {...props} renderError={renderError} />;
};

export default MainScreen;
