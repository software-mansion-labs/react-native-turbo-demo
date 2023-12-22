# React Native Web Screen

React Native Web Screen is an open source library that will allow you to easily bring your web application into the [React Native](https://reactnative.dev/) mobile world. It allows you to render web views as if they were real native screens, caching the results and providing native animation between screens. You can easily move your entire web app, or embed a few screens that pretend to be native, without having to code them second time in React Native.

## Installation

Install the library using:

```sh
npm install react-native-web-screen
```

or

```sh
yarn add react-native-web-screen
```

The library should be used alongside React Navigation library, follow [these steps](https://reactnavigation.org/docs/getting-started/) to install it.

## Basic example

The library provides you with simple API to define the relationship between the web and native screens. The `react-native-web-screen` uses React Navigation [configurable links](https://reactnavigation.org/docs/configuring-links/) to handle navigation within the app. 
You can follow react-navigation documentation to create your navigation stack and provide mapping between URLs in app and screens. You must define only those paths that are important for your app and use matchers for fallback.

You should also define your custom WebView component that will be using `VisitableView` hood, to be able to customize its behavior.

Let's say you want to add a web `Welcome` screen to your React Native app.

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { VisitProposal, VisitableView } from 'react-native-turbo';
import {
  LinkingConfig,
  getLinkingObject,
  useCurrentUrl,
  useWebviewNavigate,
} from 'react-native-web-screen';

const Stack = createNativeStackNavigator();

const baseURL = 'http://your-web-app-base-url/';

// see https://reactnavigation.org/docs/navigation-container/#linking
const linkingConfig: LinkingConfig = {
  screens: {
    Initial: '',
    Welcome: 'welcome',
    Fallback: '*'
  },
};

const linking = getLinkingObject(baseURL, linkingConfig);
// see https://github.com/hotwired/turbo-ios/blob/c476bac66f260adbfe930ed9a151e7637973ff99/Source/Session/Session.swift#L4-L7
const sessionHandle = 'app-dynamic-session-handle';

const WebView: React.FC = () => {
  const currentUrl = useCurrentUrl(baseURL, linkingConfig);
  const navigateTo = useWebviewNavigate();

  const onVisitProposal = useCallback(
    ({ action: actionType, url }: VisitProposal) => {
      navigateTo(url, actionType);
    },
    [navigateTo]
  );

  return (
    <VisitableView
      onVisitProposal={onVisitProposal}
      sessionHandle={sessionHandle}
      url={currentUrl}
      applicationNameForUserAgent="Turbo Native"
    />
  );
};

const App: React.FC = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Initial" component={YourNativeComponent} />
        <Stack.Screen name="Welcome" component={WebView} options={{ title: 'Welcome' }} />
        <Stack.Screen name="Fallback" component={WebView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

```

Now you can easily navigate to the `Welcome` web screen using react navigation API. Navigating `http://your-web-app-base-url` in the webview will result in opening react native screen `Initial`.

## Nested navigators

You are also able to use [complex navigator](https://reactnavigation.org/docs/configuring-links#handling-nested-navigators) structures inside your app. Just make sure that your navigation definition and linking object match.


## Example app

The repository contains [example app directory](../../example/README.md) and an example [web app](../../example/server/README.md) adapted from [turbo-native-demo](https://github.com/hotwired/turbo-native-demo) using react-native-web-screen.

```sh
yarn
yarn example server start
yarn example start
yarn example ios
```

https://user-images.githubusercontent.com/25584895/225870138-b034f335-a30f-4e25-92fd-06c19cdf6e04.mov

## Advanced usage

This library under the hood uses [react-native-turbo](../turbo/README.md). You can use React Navigation support (described here) or standalone React `VisitableView.tsx` component for more advanced cases. You can also define your own `WebScreen` component.

Check out [react-native-turbo](../turbo/README.md) for more info.

### Using custom WebScreen component

You can use your custom `WebScreen` component by passing it to the `buildWebScreen` config. This can be useful if you want to define custom logic for each screen.

```tsx
import { WebView } from 'react-native-webview';

const webScreens = buildWebScreen(webScreenConfig, {
  webScreenComponent: WebScreen,
});
```

To obtain `url` for current screen, use `useCurrentUrl` hook function.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
