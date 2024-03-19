import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { NativeScreen } from 'react-native-screens';

import WebView from './WebView';
import { Routes } from './webScreenRoutes';

const Tab = createMaterialTopTabNavigator();

const NestedTab: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00094a',
      }}
    >
      <Tab.Screen
        name={Routes.NestedTabWeb}
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
