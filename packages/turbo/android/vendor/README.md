# turbo-android

This folder contains necessary tools and scripts to use turbo-android library in `react-native-turbo`. Unfortunately, we need to apply some patches to make this library compatible.

## How to update turbo-android

1. Run `./update-turbo-android.sh [version]` script to update the library to the latest version. The script will download the latest version of the library and apply necessary patches.
2. Make sure, that `build.gradle` and `gradle.properties` are using the same settings as the `turbo-android` library. Especially, check if the `minSdkVersion` and all dependencies are the same.
