import React from 'react';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  buildLinkingOptions,
  WebScreenRuleConfig,
} from '@react-native-turbo-webview/navigation';
import { default as NativeScreen } from './NumbersScreen';
import ErrorScreen from './ErrorScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

type NestedTabParamsList = {
  [Routes.NestedTabNative]: undefined;
  [Routes.NestedTabWeb]: undefined;
};

type ParamsList = {
  [Routes.New]: undefined;
  [Routes.WebviewInitial]: undefined;
  [Routes.NumbersScreen]: undefined;
  [Routes.NotFound]: undefined;
  [Routes.SuccessScreen]: undefined;
  [Routes.NonExistentScreen]: undefined;
  [Routes.SignIn]: undefined;
  [Routes.Fallback]: undefined;
  [Routes.NestedTab]: NavigatorScreenParams<NestedTabParamsList>;
};

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

const webScreenConfig: WebScreenRuleConfig<ParamsList> = {
  baseURL: 'http://localhost:45678/',
  routes: {
    [Routes.WebviewInitial]: { urlPattern: '', title: 'Turbo Native Demo' },
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
    [Routes.NumbersScreen]: { urlPattern: 'numbers' },
    [Routes.SignIn]: {
      urlPattern: 'signin',
      title: 'Sign In',
      presentation: 'modal',
    },
    [Routes.Fallback]: { urlPattern: '*', title: '' },
  },
};

const WebScreen = buildLinkingOptions<ParamsList>(webScreenConfig);

const NestedTab: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name={Routes.NestedTabNative} component={NativeScreen} />
      <Tab.Screen name={Routes.NestedTabNative} component={NativeScreen} />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <NavigationContainer linking={WebScreen.linking}>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen {...WebScreen.screens.WebviewInitial} />
        <Stack.Screen
          name={Routes.NumbersScreen}
          component={NativeScreen}
          options={{ title: 'A List of Numbers' }}
        />
        <Stack.Screen {...WebScreen.screens.New} />
        <Stack.Screen {...WebScreen.screens.SuccessScreen} />
        <Stack.Screen {...WebScreen.screens.SignIn} />
        <Stack.Screen {...WebScreen.screens.Fallback} />
        <Stack.Screen
          name={Routes.NotFound}
          component={ErrorScreen}
          options={{ title: 'Not Found' }}
        />
        <Stack.Screen
          name={Routes.NestedTab}
          component={NestedTab}
          options={{ title: 'Nested Top Tab' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
