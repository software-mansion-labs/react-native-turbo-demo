# React Native Turbo

React Native apps [Hotwired Turbo](https://turbo.hotwired.dev/handbook/introduction) support for creating hybrid apps with single a single shared web view.

## Getting Started

## Usage

Turbo `web view` can be rendered using native view `VisitableView`.

```jsx
import {
  VisitableView,
  OnLoadEvent,
  VisitProposal,
  VisitProposalError,
  Session,
} from 'react-native-turbo';

const onVisitProposal = ({ nativeEvent: { action: actionType, url } }) => {
  // Handle opening new screen
};

<Session>
  <VisitableView
    url="https://turbo-native-demo.glitch.me"
    onVisitProposal={onVisitProposal}
  />
  ;
</Session>;
```

You can use `onVisitProposal()` to handle turbo visits.

### `url`

URL for the WKWebview to open.

### `onVisitProposal`

Callback called when the webview detects turbo visit action.

### `onLoad`

Callback called with screen title and url when the webview successfully loads.

### `onVisitError`

Callback called when the webview fails to load.

## Overview

The library implements native view `RNVisitable` component for React Native. This view is an equivalent of the [Turbo Visitable](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#visitable).

### Visitable

Turbo manages a single webview instance, shared between multiple view controllers. It also automatically show a screenshot of web page content when the web view is not focused. The `Visitable` views are rendered as native view from React `RNVisitable`.

### Session

Each [Session](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#session) manages a single WKWebView instance. We've added support for multiple sessions, now each session instance is managed by `<RNSession>` native component. Every `Session` is used by all its React children `RNVisitable` components. The session is shared using React.Context API.

```tsx
<Session>
  <VisitableView />
</Session>
```

Session enables communication between native app and JavaScript (the visited page):

### `onMessage`

Function that is invoked when the webview calls `postMessage`. Setting this property will inject this global into your webview.

Currently you need to individually call this function for android and for ios separately.

```
AndroidInterface.postMessage(JSON.stringify({message}));
webkit.messageHandlers.nativeApp.postMessage(message);
```

### `injectJavaScript()`

Executes the javascript code in the webview js runtime.

Supports async methods and promises.

```ts
const jsCode = "console.warn('foo')";

injectJavaScript(jsCode);
```

You are also able to use `withSession(...)` React HOC instead of composition.
