import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeScreen } from 'react-native-screens';
import { Routes } from 'example/src/webScreenRoutes';
import WebView from './WebView';

const Tab = createMaterialTopTabNavigator();

const NestedTab: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00094a',
      }}
    >
      <Tab.Screen
        name={Routes.NestedTab}
        component={WebView}
        options={{ title: 'Nested Web' }}
      />
      <Tab.Screen
        name={Routes.NestedTabNative}
        component={NativeScreen}
        options={{ title: 'Nested Native' }}
      />
    </Tab.Navigator>
  );
};

export default NestedTab;
