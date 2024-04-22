# Patches for `turbo-ios` and `turbo-android` libraries

This directory contains patches for the turbo-ios and turbo-android libraries. The patches are applied during the build process. Unfortunately, this process is necessary to make the libraries work with `react-native-turbo`.

## Changes

### `turbo-ios`

The patch removes the `NSLayoutConstraint` set in `VisitableView.installRefreshControl` method. This is necessary to make `contentInset` work properly with `UIRefreshControl`.

### `turbo-android`

The patch makes the necessary interfaces, classes and methods public so that they can be accessed from the `react-native-turbo` library.
