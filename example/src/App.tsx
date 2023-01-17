import React from 'react';
import {
  LinkingOptions,
  NavigationContainer,
  PathConfigMap,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BASE_URL, Routes } from './config';
import WebviewScreen from './WebviewScreen';
import NumbersScreen from './NumbersScreen';
import ErrorScreen from './ErrorScreen';

interface Props {}
const Stack = createNativeStackNavigator<any>();

const webviewScreensConfig: PathConfigMap<any> = {
  [Routes.WebviewInitial]: '',
  [Routes.New]: 'new',
  [Routes.SuccessScreen]: 'success',
  [Routes.NumbersScreen]: 'numbers',
  [Routes.SignIn]: 'signin',
  [Routes.Fallback]: {
    path: '*',
  },
};

const App: React.FC<Props> = () => {
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
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen
          name={Routes.WebviewInitial}
          component={WebviewScreen}
          options={{ title: 'Turbo Native Demo' }}
        />
        <Stack.Screen
          name={Routes.NumbersScreen}
          component={NumbersScreen}
          options={{ title: 'A List of Numbers' }}
        />
        <Stack.Screen
          name={Routes.New}
          component={WebviewScreen}
          options={{
            title: 'A Modal Webpage',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name={Routes.SuccessScreen}
          component={WebviewScreen}
          options={{ title: 'It Worked!', presentation: 'modal' }}
        />
        <Stack.Screen
          name={Routes.NonExistentScreen}
          component={WebviewScreen}
          options={{ title: 'Not Found' }}
        />
        <Stack.Screen
          name={Routes.SignIn}
          component={WebviewScreen}
          options={{ title: 'Sign In', presentation: 'modal' }}
        />
        <Stack.Screen
          name={Routes.NotFound}
          component={ErrorScreen}
          options={{ title: 'Not Found' }}
        />
        <Stack.Screen
          name={Routes.Fallback}
          component={WebviewScreen}
          options={{ title: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
