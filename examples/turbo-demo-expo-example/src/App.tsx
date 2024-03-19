import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import NativeNumbersScreen from './NativeNumbersScreen';
import WebView from './WebView';
import { linking } from './webScreen';
import { Routes } from './webScreenRoutes';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Use a custom getId function when navigating to the same url with different parameters.
const getId = (params: any) => JSON.stringify(params);

function ModalFlow() {
  return (
    <Stack.Navigator screenOptions={{ title: '' }}>
      <Stack.Screen name={Routes.New} getId={getId} component={WebView} />
      <Stack.Screen
        name={Routes.SuccessScreen}
        getId={getId}
        component={WebView}
      />
      <Stack.Screen name={Routes.Fallback} getId={getId} component={WebView} />
    </Stack.Navigator>
  );
}

const MainTab = () => (
  <Stack.Navigator
    screenOptions={{
      headerTintColor: '#00094a',
    }}
  >
    <Stack.Screen
      name={Routes.WebviewInitial}
      component={WebView}
      getId={getId}
      options={{ title: 'React Native Web Screen' }}
    />
  </Stack.Navigator>
);

const BottomTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name={Routes.MainTab}
        component={MainTab}
        options={{ title: 'React Native Web Screen', headerShown: false }}
      />
      <Tab.Screen
        name={Routes.NativeNumbersScreen}
        component={NativeNumbersScreen}
        options={{ title: 'Native Screen' }}
      />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',
          headerTintColor: '#00094a',
          title: '',
        }}
      >
        <Stack.Screen
          options={{ headerShown: false }}
          name={Routes.BottomTabs}
          component={BottomTabs}
        />
        <Stack.Screen
          name={Routes.ModalFlow}
          component={ModalFlow}
          options={{ title: '', presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name={Routes.Fallback}
          getId={getId}
          component={WebView}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
