# React Native Web Screen

React Native Web Screen is an open source library that will allow you to easily bring your web application into the [React Native](https://reactnative.dev/) mobile world. It allows you to render web views as if they were real native screens, caching the results and providing native animation between screens. You can easily move your entire web app, or embed a few screens that pretend to be native, without having to code them second time in React Native.

https://user-images.githubusercontent.com/25584895/225870138-b034f335-a30f-4e25-92fd-06c19cdf6e04.mov

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

## Getting started

The library provides you with simple API to define the relationship between the web and native screens.

## Advanced usage

This library under the hood uses [react-native-turbo](packages/turbo). You can use React Navigation support (described ⬆️) or standalone React `VisitableView.tsx` component for more advanced cases.

Check out [react-native-turbo](packages/turbo) for more info.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
