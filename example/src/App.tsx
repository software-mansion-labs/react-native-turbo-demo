import React, { useCallback } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { buildWebScreen, WebScreenRuleConfig } from 'react-native-web-screen';
import { default as NativeScreen } from './NumbersScreen';
import ErrorScreen from './ErrorScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { OnErrorCallback, Session, withSession } from 'react-native-turbo';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

enum Routes {
  NotFound = 'NotFound',
  NumbersScreen = 'NumbersScreen',
  WebviewInitial = 'WebviewInitial',
  New = 'New',
  SuccessScreen = 'SuccessScreen',
  NonExistentScreen = 'NonExistentScreen',
  SignIn = 'SignIn',
  Fallback = 'Fallback',
  NestedTabNative = 'NestedTabNative',
  NestedTabWeb = 'NestedTabWeb',
  NestedTab = 'NestedTab',
}

const webScreenConfig: WebScreenRuleConfig = {
  baseURL: 'http://localhost:45678/',
  routes: {
    [Routes.WebviewInitial]: {
      urlPattern: '',
      title: 'React Native Web Screen',
    },
    [Routes.New]: {
      urlPattern: 'new',
      title: 'A Modal Webpage',
      presentation: 'modal',
    },
    [Routes.SuccessScreen]: {
      urlPattern: 'success',
      title: 'It Worked!',
      presentation: 'modal',
    },
    [Routes.NumbersScreen]: {
      urlPattern: 'numbers',
    },
    [Routes.SignIn]: {
      urlPattern: 'signin',
      title: 'Sign In',
      presentation: 'modal',
    },
    [Routes.NestedTab]: {
      routes: {
        [Routes.NestedTabWeb]: {
          urlPattern: 'nested',
          title: 'Nested Web',
        },
      },
    },
    [Routes.Fallback]: { urlPattern: '*', title: '' },
  },
};

const webScreens = buildWebScreen(webScreenConfig);

const NestedTab: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00094a',
      }}
    >
      <Tab.Screen {...webScreens.screens.NestedTabWeb} />
      <Tab.Screen
        name={Routes.NestedTabNative}
        component={NativeScreen}
        options={{ title: 'Nested Native' }}
      />
    </Tab.Navigator>
  );
};

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
