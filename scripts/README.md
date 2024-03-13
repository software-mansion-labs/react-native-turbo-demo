# Scripts

This folder contains the necessary scripts for releasing new versions of the library.

## How to run scripts

You can use `sh` command to run the scripts. Make sure that you have the necessary permissions to run the scripts and you run them from the root of the project.

## How to do a release

Run the `./release.sh [version]` script to release a new version. The script will update the libraries to the specified version, build them, and publish them to the npm registry. You can run this command with the `--help` flag to see all available options.

## How to bump turbo-ios and turbo-android versions

You can bump versions in package.json located in packages/turbo directory (look for `hotwiredTurbo` setting).
