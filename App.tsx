import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TurboScreen from './src/TurboScreen';

interface Props {}

const Stack = createNativeStackNavigator<any>();

const App: React.FC<Props> = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="TurboScreen" component={TurboScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
