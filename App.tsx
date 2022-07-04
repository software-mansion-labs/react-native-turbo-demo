import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import TurboScreen from './src/TurboScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BASE_URL, Routes} from './src/config';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import PlaceholderScreen from './src/PlaceholderScreen';

interface Props {}

const Stack = createNativeStackNavigator<any>();

const Tab = createBottomTabNavigator<any>();

// const Stack = createTurboStackNavigator();

const TabBar = () => {
  return (
    <Tab.Navigator>
      <Stack.Screen
        name={Routes.PlaceholderScreen2}
        component={PlaceholderScreen}
        options={{
          title: 'Placeholder Screen 2',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name={Routes.PlaceholderScreen3}
        component={PlaceholderScreen}
        options={{
          title: 'Placeholder Screen 3',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name={Routes.WebviewScreen2}
        component={TurboScreen}
        options={{title: 'Webview 2', headerBackTitle: 'Back'}}
      />
    </Tab.Navigator>
  );
};

const App: React.FC<Props> = () => {
  const linking = {
    prefixes: [BASE_URL],
    config: {
      screens: {
        TurboScreen: 'one',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={Routes.tabBar}
        screenOptions={{
          headerBackTitle: 'Back',
        }}>
        <Stack.Screen
          name={Routes.tabBar}
          component={TabBar}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.WebviewScreen}
          component={TurboScreen}
          options={{title: ''}}
        />
        <Stack.Screen
          name={Routes.PlaceholderScreen1}
          component={PlaceholderScreen}
          options={{title: ''}}
        />
        <Stack.Screen
          name={Routes.WebviewScreen3}
          component={PlaceholderScreen}
          options={{title: '', presentation: 'modal'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
