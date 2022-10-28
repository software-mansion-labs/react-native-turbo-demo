import React, { useCallback, useRef } from 'react';
import {
  LinkingOptions,
  NavigationContainer,
  PathConfigMap,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BASE_URL, Routes } from './config';
import WebviewScreen from './WebviewScreen';
import NumbersScreen from './NumbersScreen';
import ErrorScreen from './ErrorScreen';
import { Session, withSession } from 'react-native-turbo-webview';
import { Share } from 'react-native';

interface Props {}
const Stack = createNativeStackNavigator<any>();

const webviewScreensConfig: PathConfigMap<any> = {
  [Routes.WebviewInitial]: `${BASE_URL}`,
  [Routes.New]: `${BASE_URL}/new`,
  [Routes.Two]: `${BASE_URL}/two`,
  [Routes.One]: `${BASE_URL}/one`,
  [Routes.Slow]: `${BASE_URL}/slow`,
  [Routes.NumbersScreen]: `${BASE_URL}/numbers`,
  [Routes.LongScreen]: `${BASE_URL}/long`,
  [Routes.SuccessScreen]: `${BASE_URL}/success`,
  [Routes.NonExistentScreen]: `${BASE_URL}/nonexistent`,
  [Routes.SignIn]: `${BASE_URL}/signin`,
  [Routes.Protected]: `${BASE_URL}/protected`,
  [Routes.NotFound]: `${BASE_URL}/notfound`,
  [Routes.Files]: `${BASE_URL}/files`,
  [Routes.Follow]: `${BASE_URL}/follow`,
  [Routes.Redirected]: `${BASE_URL}/redirected`,
  [Routes.Share]: `${BASE_URL}/share`,
  [Routes.NotFound]: {
    path: `${BASE_URL}/*`,
  },
};

const App: React.FC<Props> = () => {
  const sessionRef = useRef<Session>(null);

  const linking: LinkingOptions<any> = {
    prefixes: [BASE_URL],
    config: {
      screens: {
        ...webviewScreensConfig,
      },
    },
  };

  const share = async (message: string) => {
    const res = await Share.share({ message });
    if (res.action === 'sharedAction') {
      sessionRef.current?.injectJavaScript(`shared()`);
    }
  };

  const handleMessage = useCallback((message) => {
    switch (message.method) {
      case 'share': {
        share(message.shareText);
        break;
      }
    }
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <Session ref={sessionRef} onMessage={handleMessage}>
        <Stack.Navigator
          screenOptions={{
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen
            name={Routes.WebviewInitial}
            component={WebviewScreen}
            options={{ title: 'Turbo Native Demo' }}
          />
          <Stack.Screen
            name={Routes.One}
            component={WebviewScreen}
            options={{ title: "How'd You Get Here?" }}
          />
          <Stack.Screen
            name={Routes.Two}
            component={WebviewScreen}
            options={{ title: 'Push or Replace?' }}
          />
          <Stack.Screen
            name={Routes.Slow}
            component={WebviewScreen}
            options={{ title: 'Slow-loading Page' }}
          />
          <Stack.Screen
            name={Routes.NumbersScreen}
            component={NumbersScreen}
            options={{ title: 'A List of Numbers' }}
          />
          <Stack.Screen
            name={Routes.LongScreen}
            component={WebviewScreen}
            options={{ title: 'A Really Long Page' }}
          />
          <Stack.Screen
            name={Routes.New}
            component={withSession(WebviewScreen)}
            options={{
              title: 'A Modal Webpage',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name={Routes.SuccessScreen}
            component={withSession(WebviewScreen)}
            options={{ title: 'It Worked!', presentation: 'modal' }}
          />
          <Stack.Screen
            name={Routes.NonExistentScreen}
            component={WebviewScreen}
            options={{ title: 'Not Found' }}
          />
          <Stack.Screen
            name={Routes.SignIn}
            component={withSession(WebviewScreen)}
            options={{ title: 'Sign In', presentation: 'modal' }}
          />
          <Stack.Screen
            name={Routes.Protected}
            component={WebviewScreen}
            options={{ title: 'Protected Webpage' }}
          />
          <Stack.Screen
            name={Routes.Files}
            component={WebviewScreen}
            options={{ title: 'Handling Files' }}
          />
          <Stack.Screen
            name={Routes.Follow}
            component={WebviewScreen}
            options={{ title: 'Redirected Page' }}
          />
          <Stack.Screen
            name={Routes.Redirected}
            component={WebviewScreen}
            options={{ title: 'Redirected Page' }}
          />
          <Stack.Screen
            name={Routes.NotFound}
            component={ErrorScreen}
            options={{ title: 'Not Found' }}
          />
          <Stack.Screen
            name={Routes.Share}
            component={WebviewScreen}
            options={{ title: 'Try Sharing' }}
          />
        </Stack.Navigator>
      </Session>
    </NavigationContainer>
  );
};

export default App;
