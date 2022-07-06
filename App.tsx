import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BASE_URL, Routes} from './src/config';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import PlaceholderScreen from './src/PlaceholderScreen';
import {Text} from 'react-native';
import WebviewScreen from './src/WebviewScreen';
import NumbersScreen from './src/NumbersScreen';

interface Props {}

const Stack = createNativeStackNavigator<any>();
const Tab = createBottomTabNavigator<any>();

const TabBar = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name={Routes.PlaceholderScreen2}
        component={PlaceholderScreen}
        options={{
          title: 'Placeholder Screen 2',
        }}
      />
      <Tab.Screen
        name={Routes.PlaceholderScreen3}
        component={PlaceholderScreen}
        options={{
          title: 'Placeholder Screen 3',
        }}
      />
      <Tab.Screen
        name={Routes.WebviewScreen2}
        component={WebviewScreen}
        options={{title: 'Webview Screen 2'}}
      />
    </Tab.Navigator>
  );
};

const App: React.FC<Props> = () => {
  const linking = {
    prefixes: [BASE_URL],
    config: {
      screens: {
        [Routes.WebviewScreen]: '*',
        [Routes.WebviewModal]: 'new',
        [Routes.NumbersScreen]: 'numbers',
      },
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      fallback={() => <Text>fallback component</Text>}>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',
        }}>
        <Stack.Screen
          name={Routes.TabBar}
          component={TabBar}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.WebviewScreen}
          component={WebviewScreen}
          options={{title: 'Webview Screen'}}
        />
        <Stack.Screen
          name={Routes.NumbersScreen}
          component={NumbersScreen}
          options={{title: 'A List of Numbers'}}
        />
        <Stack.Screen
          name={Routes.WebviewModal}
          component={WebviewScreen}
          options={{title: '', presentation: 'modal'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
