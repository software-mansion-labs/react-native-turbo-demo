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

Currently on iOS, you need to manually add the Turbo dependency to your Podfile:

```ruby
pod 'Turbo', :git => 'https://github.com/hotwired/turbo-ios.git', :tag => '7.0.0-rc.6'
```

The library should be used alongside React Navigation library, follow [these steps](https://reactnavigation.org/docs/getting-started/) to install it.

## Basic example

The library provides you with simple API to define the relationship between the web and native screens. The `react-native-web-screen` uses React Navigation [configurable links](https://reactnavigation.org/docs/configuring-links/) to handle navigation within the app. To generate the desired linking configuration you can use the `buildWebScreen(webScreenConfig)` function. After that, all you need to do is to pass the generated objects to the [Navigation Container](https://reactnavigation.org/docs/navigation-container/) and to the corresponding screens in the navigator tree.

Let's say you want to add a web `Welcome` screen to your React Native app.

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { buildWebScreen, WebScreenRuleConfig } from 'react-native-web-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const webScreenConfig: WebScreenRuleConfig = {
  baseURL: 'http://your-web-app-base-url/',
  routes: {
    Initial: {
      urlPattern: '',
    },
    Welcome: {
      urlPattern: 'welcome',
      title: 'Welcome!',
    },
  },
};

const WebScreen = buildWebScreen(webScreenConfig);

const App: React.FC = () => {
  return (
    <NavigationContainer linking={WebScreen.linking}>
      <Stack.Navigator>
        <Stack.Screen name="Initial" component={YourNativeComponent} />
        <Stack.Screen {...WebScreen.screens.Welcome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

Now you can easily navigate to the `Welcome` web screen using react navigation API. Navigating `http://your-web-app-base-url` in the webview will result in opening react native screen `Initial`.

## Nested navigators

You are also able to use [complex navigator](https://reactnavigation.org/docs/configuring-links#handling-nested-navigators) structures inside your app. You can define the `react-native-web-screen` config with nested navigators.

```tsx
const webScreenConfig: WebScreenRuleConfig = {
  baseURL: 'http://your-web-app-base-url/',
  routes: {
    Welcome: {
      urlPattern: 'welcome',
      title: 'Welcome!',
    },
    NestedStack: {
      routes: {
        NestedStackScreen: {
          urlPattern: 'nested',
          title: 'Nested Screen',
        },
      },
    },
  },
};
```

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

This library under the hood uses [react-native-turbo](../turbo/README.md). You can use React Navigation support (described here) or standalone React `VisitableView.tsx` component for more advanced cases.

Check out [react-native-turbo](../turbo/README.md) for more info.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
