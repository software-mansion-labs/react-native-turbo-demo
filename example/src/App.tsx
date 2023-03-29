import React, { useCallback } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { default as NativeScreen } from './NumbersScreen';
import ErrorScreen from './ErrorScreen';
import { OnErrorCallback, Session, withSession } from 'react-native-turbo';
import { Routes, webScreens } from 'example/src/webScreen';
import NestedTab from 'example/src/NestedTab';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const navigation = useNavigationContainerRef<any>();

  const handleVisitError = useCallback<OnErrorCallback>(
    (error) => {
      const notLoggedIn = error.statusCode === 401;
      if (notLoggedIn) {
        navigation.goBack();
        navigation.navigate(Routes.SignIn, { path: 'signin' });
      }
    },
    [navigation]
  );

  return (
    <Session onVisitError={handleVisitError}>
      <NavigationContainer linking={webScreens.linking} ref={navigation}>
        <Stack.Navigator
          screenOptions={{
            headerBackTitle: 'Back',
            headerTintColor: '#00094a',
          }}
        >
          <Stack.Screen {...webScreens.screens.WebviewInitial} />
          <Stack.Screen
            name={Routes.NumbersScreen}
            component={NativeScreen}
            options={{ title: 'A List of Numbers' }}
          />
          <Stack.Screen {...webScreens.screens.New} />
          <Stack.Screen {...webScreens.screens.SuccessScreen} />
          <Stack.Screen {...webScreens.screens.SignIn} />
          <Stack.Screen {...webScreens.screens.Fallback} />
          <Stack.Screen
            name={Routes.NotFound}
            component={ErrorScreen}
            options={{ title: 'Not Found' }}
          />
          <Stack.Screen
            name={Routes.NestedTab}
            component={withSession(NestedTab)}
            options={{ title: 'Nested Top Tab' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Session>
  );
};

export default App;
