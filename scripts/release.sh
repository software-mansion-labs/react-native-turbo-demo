#!/bin/bash

shopt -s extglob

if [[ "$*" == *"--help"* || "$*" == *"-h"* ]]; then
    echo "Usage: release.sh [increment_type] [--turbo-ios-version] [--turbo-android-version] [--create-github-release]"
    echo "  increment_type: The type of version increment to perform. Must be one of: patch, minor, major, prepatch, preminor, premajor."
    echo "  --turbo-ios-version: The version of turbo-ios to use when publishing the new version."
    echo "  --turbo-android-version: The version of turbo-android to use when publishing the new version."
    echo "  --no-github-release: Skip creating a Github release after publishing the new version."
    exit 0
fi

# Default turbo-ios and turbo-android versions
TURBO_IOS_VERSION="7.0.2"
TURBO_ANDROID_VERSION="7.1.0"

INCREMENT_TYPE=$1

if [[ $INCREMENT_TYPE != @(patch|minor|major|prepatch|preminor|premajor) ]]
then
    echo "You must pass an increment type as the first argument: patch, minor, major, prepatch, preminor, or premajor."
    exit 1
fi

if [[ "$*" == *"--turbo-ios-version"* ]]; then
    TURBO_IOS_VERSION=$(echo $* | grep -oP -- "--turbo-ios-version \K[0-9.]+")
fi

if [[ "$*" == *"--turbo-android-version"* ]]; then
    TURBO_ANDROID_VERSION=$(echo $* | grep -oP -- "--turbo-android-version \K[0-9.]+")
fi

if [[ -z "$GH_TOKEN" && "$*" != *"--no-github-release"* ]]; then
    echo "You must provide a Github token in the GH_TOKEN environment variable to do the release. You can also pass the --no-github-release flag to skip creating a Github release after publishing the new version."
    exit 1
fi

echo "Using turbo-ios version $TURBO_IOS_VERSION"
sh install-turbo-ios.sh $TURBO_IOS_VERSION

echo "Using turbo-android version $TURBO_ANDROID_VERSION"
sh install-turbo-android.sh $TURBO_ANDROID_VERSION

LERNA_COMMAND="npx lerna publish $INCREMENT_TYPE --no-private --conventional-commits --preid rc --yes --force-publish"

if [[ "$*" != *"--no-github-release"* ]]; then
    LERNA_COMMAND="$LERNA_COMMAND --create-release github"
fi

$LERNA_COMMAND
