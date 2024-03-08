# Scripts

This folder contains the necessary tools and scripts for using the `turbo-android` and `turbo-ios` libraries in `react-native-turbo` and for releasing new versions of the library.

## How to run scripts

You can use `sh` command to run the scripts. Make sure that you have the necessary permissions to run the scripts and you run them from the root of the project.

## How to do a release

Run the `./release.sh [version]` script to release a new version. The script will update the libraries to the specified version, build them, and publish them to the npm registry. You can run this command with the `--help` flag to see all available options.

## How to build the `turbo-android` library

Run the `./build-turbo-android.sh [version]` script to update the library to the given version. The script will download the given version of the library, apply the necessary patches, and copy dependencies to the `turbo-android-dependencies.gradle` file.

## How to build the `turbo-ios` library

Run the `./build-turbo-ios.sh [version]` script to update the library to the given version. The script will download the given version of the library and include it in the `react-native-turbo` package.
