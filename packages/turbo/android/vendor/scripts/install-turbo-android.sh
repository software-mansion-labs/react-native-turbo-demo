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

# Build .aar file
./gradlew clean assemble -p turbo

# Copy .aar file to lib directory
LIB_DIR=$(realpath ../../libs)
cp ./turbo/build/outputs/aar/turbo-release.aar $LIB_DIR/turbo-android.aar
