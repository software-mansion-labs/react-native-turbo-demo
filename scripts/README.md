# Scripts

This folder contains necessary tools and scripts to use `turbo-android` and `turbo-ios` library in `react-native-turbo`. Unfortunately, we need to apply some patches to make `turbo` libraries compatible.

## How to update turbo-android

Run `./update-turbo-android.sh [version]` script to update the library to the latest version. The script will download the latest version of the library, apply necessary patches and copy dependencies to `dependencies.gradle` file.
