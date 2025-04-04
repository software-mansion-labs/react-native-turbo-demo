# Patches for `hotwire-native-ios` and `hotwire-native-android` libraries

This directory contains patches for the `hotwire-native-ios` and `hotwire-native-android` libraries. The patches are applied during the build process. Unfortunately, this process is necessary to make the libraries work correctly with `react-native-turbo`.

## Changes

### `hotwire-native-ios`

The patch removes the `NSLayoutConstraint` set in `VisitableView.installRefreshControl` method. This is necessary to make `contentInset` work properly with `UIRefreshControl`.

### `hotwire-native-android`

The patch makes the necessary interfaces, classes and methods public so that they can be accessed from the `react-native-turbo` native land.
