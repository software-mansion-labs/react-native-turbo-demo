TURBO_ANDROID_REPO_PATH="https://github.com/hotwired/turbo-android.git"
TURBO_ANDROID_MAIN_SOURCE_DIR="./turbo/src/main/*"

# First argument is the version tag
if [ -z "$1" ]
  then
    echo "No version tag supplied"
    exit 1
fi

# Shallow clone the turbo-ios repo
cd ..
rm -rf turbo-android
git clone --branch $1 --depth 1 $TURBO_ANDROID_REPO_PATH

# Apply patch
cd turbo-android
git apply ../patches/react-native-support.patch

# Move files to src/main
rsync -av --ignore-existing --remove-source-files $TURBO_ANDROID_MAIN_SOURCE_DIR  ../../src/main

# Clean up
cd ..
rm -rf turbo-android
