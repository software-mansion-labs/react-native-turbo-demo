import React from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { default as NativeScreen } from './NumbersScreen';
import ErrorScreen from './ErrorScreen';
import { linking } from 'example/src/webScreen';
import NestedTab from 'example/src/NestedTab';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Routes } from 'example/src/webScreenRoutes';
import ShareScreen from 'example/src/ShareScreen';
import WebView from './WebView';
import MainScreen from './MainScreen';

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: '#00094a',
        tabBarActiveTintColor: '#00094a',
      }}
    >
      <Tab.Screen
        name={Routes.WebviewInitial}
        component={MainScreen}
        options={{ title: 'React Native Web Screen' }}
      />
      <Tab.Screen
        name={Routes.NestedTabNative}
        component={NativeScreen}
        options={{ title: 'Native Tab' }}
      />
    </Tab.Navigator>
  );
};

const FocusedFlow = () => (
  <Stack.Navigator
    screenOptions={{
      headerTintColor: '#00094a',
      tabBarActiveTintColor: '#00094a',
    }}
  >
    <Stack.Screen
      name={Routes.SuccessScreen}
      component={WebView}
      options={{
        title: 'It Worked!',
        presentation: 'modal',
      }}
    />
    <Stack.Screen
      name={Routes.New}
      component={WebView}
      options={{
        title: 'A Modal Webpage',
        presentation: 'modal',
      }}
    />
  </Stack.Navigator>
);

export const navigationRef = createNavigationContainerRef();

const App: React.FC = () => {
  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
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
        <Stack.Screen
          name={Routes.NumbersScreen}
          component={NativeScreen}
          options={{ title: 'A List of Numbers' }}
        />
        <Stack.Screen
          name={Routes.FocusedFlow}
          component={FocusedFlow}
          options={{
            title: 'A Modal Webpage',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name={Routes.One}
          component={WebView}
          options={{
            title: "How'd You Get Here?",
          }}
        />
        <Stack.Screen name={Routes.Share} component={ShareScreen} />
        <Stack.Screen name={Routes.Fallback} component={WebView} />
        <Stack.Screen
          name={Routes.SignIn}
          component={WebView}
          options={{
            presentation: 'formSheet',
            gestureEnabled: false,
          }}
        />
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
