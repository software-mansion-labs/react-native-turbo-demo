import React from 'react';
import {
  LinkingOptions,
  NavigationContainer,
  PathConfigMap,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BASE_URL, Routes} from './src/config';
import WebviewScreen from './src/WebviewScreen';
import NumbersScreen from './src/NumbersScreen';
import ErrorScreen from './src/ErrorScreen';

interface Props {}
const Stack = createNativeStackNavigator<any>();

const webviewScreensConfig: PathConfigMap<any> = {
  [Routes.WebviewInitial]: `${BASE_URL}`,
  [Routes.New]: `${BASE_URL}/new`,
  [Routes.Two]: `${BASE_URL}/two`,
  [Routes.One]: `${BASE_URL}/one`,
  [Routes.Slow]: `${BASE_URL}/slow`,
  [Routes.NumbersScreen]: `${BASE_URL}/numbers`,
  [Routes.LongScreen]: `${BASE_URL}/long`,
  [Routes.SuccessScreen]: `${BASE_URL}/success`,
  [Routes.NonExistentScreen]: `${BASE_URL}/nonexistent`,
  [Routes.SignIn]: `${BASE_URL}/signin`,
  [Routes.Protected]: `${BASE_URL}/protected`,
  [Routes.NotFound]: {
    path: `${BASE_URL}/*`,
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
        }}>
        <Stack.Screen
          name={Routes.WebviewInitial}
          component={WebviewScreen}
          options={{title: 'Turbo Native Demo'}}
        />
        <Stack.Screen
          name={Routes.One}
          component={WebviewScreen}
          options={{title: "How'd You Get Here?"}}
        />
        <Stack.Screen
          name={Routes.Two}
          component={WebviewScreen}
          options={{title: 'Push or Replace?'}}
        />
        <Stack.Screen
          name={Routes.Slow}
          component={WebviewScreen}
          options={{title: 'Slow-loading Page'}}
        />
        <Stack.Screen
          name={Routes.NumbersScreen}
          component={NumbersScreen}
          options={{title: 'A List of Numbers'}}
        />
        <Stack.Screen
          name={Routes.LongScreen}
          component={WebviewScreen}
          options={{title: 'A Really Long Page'}}
        />
        <Stack.Screen
          name={Routes.New}
          component={WebviewScreen}
          options={{title: 'A Modal Webpage', presentation: 'modal'}}
        />
        <Stack.Screen
          name={Routes.SuccessScreen}
          component={WebviewScreen}
          options={{title: 'It Worked!', presentation: 'modal'}}
        />
        <Stack.Screen
          name={Routes.NonExistentScreen}
          component={WebviewScreen}
          options={{title: 'Not Found'}}
        />
        <Stack.Screen
          name={Routes.SignIn}
          component={WebviewScreen}
          options={{title: 'Sign In', presentation: 'modal'}}
        />
        <Stack.Screen
          name={Routes.Protected}
          component={WebviewScreen}
          options={{title: 'Protected'}}
        />
        <Stack.Screen
          name={Routes.NotFound}
          component={ErrorScreen}
          options={{title: 'Not Found'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
