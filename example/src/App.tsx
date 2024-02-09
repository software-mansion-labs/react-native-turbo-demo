import React from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { default as NativeScreen } from './NumbersScreen';
import { linking } from 'example/src/webScreen';
import NestedTab from 'example/src/NestedTab';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Routes } from 'example/src/webScreenRoutes';
import ShareScreen from 'example/src/ShareScreen';
import WebView from './WebView';
import MainScreen from './MainScreen';

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

const getId = (params: any) => JSON.stringify(params);

const FirstTabFlow = () => (
  <Stack.Navigator
    screenOptions={{
      headerTintColor: '#00094a',
    }}
  >
    <Stack.Screen
      name={Routes.WebviewInitial}
      component={MainScreen}
      options={{ title: 'React Native Web Screen' }}
    />
    <Stack.Screen name={Routes.Share} component={ShareScreen} />
  </Stack.Navigator>
);

function ModalFlow() {
  return (
    <Stack.Navigator screenOptions={{ title: '' }}>
      <Stack.Screen
        name={Routes.SignIn}
        component={WebView}
        getId={getId}
        options={{
          gestureEnabled: false,
        }}
      />
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

const BottomTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name={Routes.FirstTabFlow}
        component={FirstTabFlow}
        options={{ title: 'React Native Web Screen', headerShown: false }}
      />
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

  return (
    <NavigationContainer linking={linking} ref={navigation}>
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
          name={Routes.NestedTab}
          component={NestedTab}
          options={{ title: 'Nested Top Tab' }}
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
