# React Native Turbo

React Native [Hotwired Turbo](https://turbo.hotwired.dev/handbook/introduction) support for creating hybrid apps with a single shared web view session.

<p>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/react-native-turbo" target="_blank">
    <img alt="NPM version" src="https://img.shields.io/npm/v/react-native-turbo?color=red&label=npm%20version" />
  </a>
  <a aria-label="Licence MIT" href="https://www.npmjs.com/package/react-native-web-screen" target="_blank">
    <img alt="Licence MIT" src="https://img.shields.io/github/license/software-mansion-labs/react-native-turbo-demo" />
  </a>
</p>

---

## Installation

First step is to install `react-native-turbo` as a dependency to your project:

```
yarn add react-native-turbo
```

Currently on iOS you need to manually add the [Turbo](https://github.com/hotwired/turbo-ios/blob/main/Docs/Installation.md#cocoapods) dependency to your `Podfile`:

```
pod 'Turbo', :git => 'https://github.com/hotwired/turbo-ios.git', :tag => '7.0.0-rc.6'
```

For Android you need to adjust your SDK version in your `build.gradle`.

> [_Turbo Documentation:_](https://github.com/hotwired/turbo-android#requirements)
>
> Android SDK 24+ is required as the minSdkVersion in your build.gradle.

## Example

Turbo `webview` can be rendered using native view `VisitableView`.

```jsx
import {
  VisitableView,
  OnLoadEvent,
  VisitProposal,
  VisitProposalError,
  Session,
} from 'react-native-turbo';
import { useNavigation } from '@react-navigation/native';

const TurboScreen = () => {
  const navigation = useNavigation();

  const onVisitProposal = ({ nativeEvent: { action: actionType, url } }) => {
    // Handle opening new screen e.g. using react-navigation
    navigation.push('TurboScreen', { url });
  };

  return (
    <Session>
      <VisitableView
        url="https://turbo-native-demo.glitch.me"
        onVisitProposal={onVisitProposal}
      />
    </Session>
  );
};
```

You can use `onVisitProposal()` to handle turbo visits.

# API Reference

## VisitableView Component

Turbo manages a single webview instance, shared between multiple view controllers. It also automatically shows a screenshot of web page content when the web view is not focused. The `Visitable` views are rendered as a native view from React `RNVisitable`.

The library implements a native view `RNVisitable` component for React Native. This view is equivalent to the [Turbo Visitable](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#visitable).

### Props:

### `url`

URL for the WKWebview to open. Changing the url should result in view replacing opening different page.

### `onVisitProposal`

Callback called when the webview detects turbo visit action.

- url
- action – e.g "replace"

### `onLoad`

Callback called with screen title and URL when the webview successfully loads.

- url
- title – web page title

### `onVisitError`

Callback called when the webview fails to load.

- statusCode
- url
- error

### `onMessage`

Function that is invoked when the webview calls `postMessage`. Setting this property will inject this global into your webview.

Currently you need to individually call this function for android and for ios separately.

```
AndroidInterface.postMessage(JSON.stringify({message}));
webkit.messageHandlers.nativeApp.postMessage(message);
```

### Methods:

### `injectJavaScript(jsCode)`

Executes the javascript code in the webview js runtime.

Supports async methods and promises.

```ts
const jsCode = "console.warn('foo')";

injectJavaScript(jsCode);
```

## Session Component

Each [Session](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#session) manages a single WKWebView instance. We've added support for multiple sessions, now each session instance is managed by `<RNSession>` native component. Every `Session` is used by all its React children `RNVisitable` components. The session is shared using React.Context API.

```tsx
<Session>
  <VisitableView />
</Session>
```

The session enables communication between the native app and JavaScript (the visited page).

You are also able to use `withSession(...)` React HOC instead of composition.

### Props:

### `onMessage`

Function that is invoked when the webview calls `postMessage`. Setting this property will inject this global into your webview.

```
AndroidInterface.postMessage(JSON.stringify({message}));
webkit.messageHandlers.nativeApp.postMessage(message);
```

### Methods:

### `injectJavaScript(jsCode)`

Executes the javascript code in the webview js runtime.

Supports async methods and promises.

```ts
const jsCode = "console.warn('foo')";

injectJavaScript(jsCode);
```
