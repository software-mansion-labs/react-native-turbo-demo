# Scripts

This folder contains the necessary tools and scripts for using the `turbo-android` and `turbo-ios` libraries in `react-native-turbo` and for releasing new versions of the library.

## How to do a release

Run the `./release.sh [version]` script to release a new version of the libraries. The script will update the libraries to the specified version, build them, and publish them to the npm registry. You can run this command with the `--help` flag to see all available options.

## How to build the `turbo-android` library

Run the `./build-turbo-android.sh [version]` script to update the library to the latest version. The script will download the latest version of the library, apply the necessary patches, and copy dependencies to the `turbo-android-dependencies.gradle` file.

## How to build the `turbo-ios` library

Run the `./build-turbo-ios.sh [version]` script to update the library to the latest version. The script will download the latest version of the library and apply the necessary patches.
