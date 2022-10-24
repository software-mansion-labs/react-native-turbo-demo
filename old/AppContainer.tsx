import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View, StyleSheet} from 'react-native';

const styles = StyleSheet.create({});

interface Props {}

const AppContainer: React.FC<Props> = ({children}) => {
  const linking: LinkingOptions<any> = {
    prefixes: [BASE_URL],
    config: {
      screens: {
        ...webviewScreensConfig,
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Session onMessage={handleMessage}>{children}</Session>
    </NavigationContainer>
  );
};

export default AppContainer;
