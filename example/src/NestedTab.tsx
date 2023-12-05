import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { webScreenConfig } from 'example/src/webScreen';
import { NativeScreen } from 'react-native-screens';
import { Routes } from 'example/src/webScreenRoutes';
import { useWebScreen } from 'react-native-web-screen';

const Tab = createMaterialTopTabNavigator();

const NestedTab: React.FC = () => {
  const { webScreens } = useWebScreen(webScreenConfig);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00094a',
      }}
    >
      {webScreens(Tab, Routes.NestedTabWeb)}
      <Tab.Screen
        name={Routes.NestedTabNative}
        component={NativeScreen}
        options={{ title: 'Nested Native' }}
      />
    </Tab.Navigator>
  );
};

export default NestedTab;
