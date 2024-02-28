# First argument is the version tag
if [ -z "$1" ]
  then
    echo "No version tag supplied"
    exit 1
fi

# Patch applied to turbo-ios which fixes the resource loading issue
PATCH_PATH=$(realpath ../patches/turbo-js-resource.patch)
HOTWIRED_SOURCE_TURBO_IOS_PATH=$(realpath ../packages/hotwired/turbo-ios/Source)
REACT_NATIVE_TURBO_IOS_PATH=$(realpath ../packages/turbo/ios/turbo-ios)

# Update the turbo-ios git submodule
cd ../packages/hotwired/turbo-ios
git fetch --all --tags --prune
git checkout tags/$1 -B $1
git apply $PATCH_PATH
git add .
git commit -m "Apply patch"

# Update the files in turbo package
rm -rf $REACT_NATIVE_TURBO_IOS_PATH/*
cp -R $HOTWIRED_SOURCE_TURBO_IOS_PATH/* $REACT_NATIVE_TURBO_IOS_PATH

# Run yarn in the root directory
cd ../../..
yarn
