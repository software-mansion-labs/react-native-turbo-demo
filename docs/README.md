# Docs page 📖

## Turbo implementation for React Native

The example implements native view `RNVisitable` component for React Native. This view is an equivalent of the [Turbo Visitable](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#visitable).

### Visitable

Turbo manages a single webview instance, shared between multiple view controllers. It also automatically show a screenshot of web page content when the web view is not focused. The `Visitable` views are rendered as native view from React `RNVisitable`.

### Session

Each [Session](https://github.com/hotwired/turbo-ios/blob/main/Docs/Overview.md#session) manages a single WKWebView instance. Currently the session is stored in the `RNVisitableViewManager`. For now the example doesn't support multiple session setup, but single session should be enough for majority of cases (multiple session is recommended for e.g tab bar support).

### Visitable component

We can use React Navigation support (described below) or standalone React `VisitableView.tsx` component for more advanced cases.

```tsx
const onVisitProposal = ({
  nativeEvent: {action: actionType, url},
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
