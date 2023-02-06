import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  buildLinkingOptions,
  WebScreenRuleConfig,
} from '@react-native-turbo-webview/navigation';
import { ParamsList, Routes } from './config';
import NumbersScreen from './NumbersScreen';
import ErrorScreen from './ErrorScreen';

const Stack = createNativeStackNavigator();

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
          component={NumbersScreen}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
