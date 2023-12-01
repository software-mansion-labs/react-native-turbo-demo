import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { webScreenConfig } from 'example/src/webScreen';
import { NativeScreen } from 'react-native-screens';
import { Routes } from 'example/src/webScreenRoutes';
import { webStackScreen } from 'react-native-web-screen';

const Tab = createMaterialTopTabNavigator();

const NestedTab: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00094a',
      }}
    >
      {webStackScreen(Tab, webScreenConfig, Routes.NestedTabWeb)}
      <Tab.Screen
        name={Routes.NestedTabNative}
        component={NativeScreen}
        options={{ title: 'Nested Native' }}
      />
    </Tab.Navigator>
  );
};

export default NestedTab;
