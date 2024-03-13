#!/bin/bash

shopt -s extglob

if [[ "$*" == *"--help"* || "$*" == *"-h"* ]]; then
    echo "Usage: release.sh [increment_type] [--turbo-ios-version] [--turbo-android-version] [--create-github-release]"
    echo "  increment_type: The type of version increment to perform. Must be one of: patch, minor, major, prepatch, preminor, premajor."
    echo "  --no-github-release: Skip creating a Github release after publishing the new version."
    exit 0
fi

INCREMENT_TYPE=$1

if [[ $INCREMENT_TYPE != @(patch|minor|major|prepatch|preminor|premajor) ]]
then
    echo "You must pass an increment type as the first argument: patch, minor, major, prepatch, preminor, or premajor."
    exit 1
fi


if [[ -z "$GH_TOKEN" && "$*" != *"--no-github-release"* ]]; then
    echo "You must provide a GitHub authentication token in the GH_TOKEN environment variable to perform the release. Alternatively, you can pass the --no-github-release flag to skip creating a GitHub release after publishing the new version."
    exit 1
fi

LERNA_COMMAND="npx lerna publish $INCREMENT_TYPE --no-private --conventional-commits --preid rc --yes"

if [[ "$*" != *"--no-github-release"* ]]; then
    LERNA_COMMAND="$LERNA_COMMAND --create-release github"
fi


# Prepare the environment
yarn

# Run the release command
$LERNA_COMMAND
