# Docs page 📖

## Installation

```sh
npm install react-native-turbo-webview
```

## Turbo implementation for React Native

The example implements native view `RNVisitable` component for React Native. This view is an equivalent of the [Turbo Visitable](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#visitable).

### Visitable

Turbo manages a single webview instance, shared between multiple view controllers. It also automatically show a screenshot of web page content when the web view is not focused. The `Visitable` views are rendered as native view from React `RNVisitable`.

### Session

Each [Session](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#session) manages a single WKWebView instance. We've added support for multiple sessions, now each session instance is managed by `<RNSession>` native component. Every `Session` is used by all its React children `RNVisitable` components. The session is shared using React.Context API.

```tsx
<Session>
  <VisitableView />
</Session>
```

You are also able to use `withSession(...)` React HOC instead of composition.

### Visitable component

We can use React Navigation support (described below) or standalone React `VisitableView.tsx` component for more advanced cases.

```tsx
const onVisitProposal = ({
  nativeEvent: { action: actionType, url },
}: NativeSyntheticEvent<VisitProposal>) => {
  // Handle opening new webview screen
};

<VisitableView
  url="https://turbo-native-demo.glitch.me"
  onVisitProposal={onVisitProposal}
/>;
```

Props:

- **url** – _URL for the WKWebview to open_

- **onVisitProposal** – _callback called when the webview detects changing navigate action_
- **onLoad** – _callback called when the webview successfully loads_
- **onVisitError** – _callback called when the webview fails to load_

## React Navigation integration 🔗

The example uses [Configurable Links](https://reactnavigation.org/docs/configuring-links) for smooth integration with the webview. It enables us to:

- Open native screen from webview.
- Open webview from native screen.
- Open webview screen from webview screen.
- Setup title for every webview screen (we don't need to wait for the page load).
- It supports Turbo replace action.
- We can set the presentation type to modal.

Example setup for example setup see [App.tsx](../App.tsx).

## Examples

You can see all the examples in action, just check out the example app. You need to first start the local demo web page from the [demo directory](../demo/).

### Opening webview from RN screen

You need to use the [useWebviewNavigate](../src/useWebviewNavigate.ts) hook which is a slightly modified [useLinkTo](https://github.com/react-navigation/react-navigation/blob/4ae53e1705e39aee75041928c07a56ec110bfd05/packages/native/src/useLinkTo.tsx) hook from React Navigation.

```ts
const navigateTo = useWebviewNavigate();
navigateTo(urlOrPath, actionType /* "replace" | "advance" */);
```

### Opening RN screen from webview

In the linking object in the `<NavigationContainer/>` you need to define the url/route that opens specific screen.

You can also add a wildcard path that will be navigated to on all URLs matching the prefixes, but not matching any other defined screens.

```ts
const linking = {
  prefixes: [BASE_URL],
  config: {
    screens: {
      NativeNumbersScreenName: '/numbers',
      FallbackScreen: {
        path: '*'
      }
    },
  },
};
```

When you open this link in the webview, you will automatically be taken to a screen in RN.

### Opening webview screen from a webview

```ts
const linking: LinkingOptions<any> = {
  prefixes: [BASE_URL],
  config: {
    screens: {
      FirstScreen: '/firstScreen',
      SecondScreen: '/secondScreen',
    },
  },
};
```

But wildcard support is in progress.

### Example authorization

See example app [WebviewScreen.tsx](../src/WebviewScreen.tsx).

```tsx
const onVisitError = ({
  nativeEvent: { statusCode },
}: NativeSyntheticEvent<VisitProposalError>) => {
  switch (statusCode) {
    case 401: {
      // Open sign in screen
      navigateTo(`/signin`);
      break;
    }
    default: {
      navigateTo(`/notfound`, 'replace');
    }
  }
};

<VisitableView
  url={currentUrl}
  onVisitProposal={onVisitProposal}
  onVisitError={onVisitError}
  onLoad={onLoad}
/>;
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
