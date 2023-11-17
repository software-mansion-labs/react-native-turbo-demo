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
    <VisitableView
      url="https://turbo-native-demo.glitch.me"
      onVisitProposal={onVisitProposal}
    />
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

### `sessionHandle`

Session handle for the webview. If not provided, the default session will be used. It can be used to create separate webview instances for different parts of the app.

### `applicationNameForUserAgent`

The name of the application as used in the user agent string.

### `stradaComponents`

`VisitableView` supports defining [Strada components](https://strada.hotwired.dev/) that receive and reply to messages from web components that are present on the page within one session. This prop accepts an array of Strada components that will be registered in the webview.

You can define a Strada component by extending `BridgeComponent` class and implementing `onReceive` method and static `name` property.

```jsx
import { BridgeComponent } from 'react-native-turbo';

export default class FormComponent extends BridgeComponent {
  static name = 'form';

  onReceive(message: StradaMessage) {

    // Here you can catch events from webview and respond to them
    if (message.event === 'connect'){
      this.replyTo(message.event, { status: 'connected' });
    }
    ...
  }
}
```

In the WebView component, you should pass the array of Strada components to the `stradaComponents` prop.

```jsx
const stradaComponents = [FormComponent];

...

<VisitableView
  ...
  stradaComponents={stradaComponents}
/>
```

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

Session component has been deprecated. To use multiple [sessions](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#session), you can use `sessionHandle` prop on `VisitableView` component.
