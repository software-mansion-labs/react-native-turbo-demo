import React from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { default as NativeScreen } from './NumbersScreen';
import ErrorScreen from './ErrorScreen';
import { webScreenConfig, linkingConfiguration } from 'example/src/webScreen';
import NestedTab from 'example/src/NestedTab';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Routes } from 'example/src/webScreenRoutes';
import { useWebScreen } from 'react-native-web-screen';

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

const BottomTabs = () => {
  const { webScreens } = useWebScreen(webScreenConfig);

  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: '#00094a',
        tabBarActiveTintColor: '#00094a',
      }}
    >
      {webScreens(Tab, Routes.BottomTabs)}
      <Tab.Screen
        name={Routes.NestedTabNative}
        component={NativeScreen}
        options={{ title: 'Native Tab' }}
      />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  const navigation = useNavigationContainerRef();
  const { webScreens } = useWebScreen(webScreenConfig);
  return (
    <NavigationContainer linking={linkingConfiguration} ref={navigation}>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',
          headerTintColor: '#00094a',
        }}
      >
        <Stack.Screen
          options={{ headerShown: false }}
          name={Routes.BottomTabs}
          component={BottomTabs}
        />
        {webScreens(Stack)}
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
