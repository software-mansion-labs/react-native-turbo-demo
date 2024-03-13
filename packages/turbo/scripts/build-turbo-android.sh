TURBO_ANDROID_REPO_PATH="https://github.com/hotwired/turbo-android.git"
TURBO_ANDROID_MAIN_SOURCE_DIR="./turbo/src/main/*"
TURBO_ANDROID_VERSION=$1
PATCH_DIR=$(realpath ./patches)
TURBO_ANDROID_DIR=$(realpath ./android)
DEPENDENCIES_GRADLE_FILE="turbo-android-dependencies.gradle"
DEPENDENCY_REGEX="[a-zA-Z0-9.\-]+:[a-zA-Z0-9.\-]+:[0-9a-zA-Z.\-]+"

# First argument is the version tag
if [ -z "$TURBO_ANDROID_VERSION" ]
  then
    echo "No version tag supplied"
    exit 1
fi

echo "turbo-android version: $TURBO_ANDROID_VERSION"

cd $TURBO_ANDROID_DIR
rm -rf vendor
mkdir vendor

# Shallow clone the turbo-ios repo
rm -rf turbo-android
git clone --branch $TURBO_ANDROID_VERSION --depth 1 $TURBO_ANDROID_REPO_PATH

# Apply patch
cd turbo-android
git apply $PATCH_DIR/turbo-android-react-native-support.patch

# Build .aar file
./gradlew clean assemble -p turbo

# Copy .aar file to lib directory
cp ./turbo/build/outputs/aar/turbo-release.aar $TURBO_ANDROID_DIR/vendor/turbo-android.aar

# Get necessary dependencies from turbo build.gradle
./gradlew turbo:dependencies --configuration implementation > deps.txt
./gradlew turbo:dependencies --configuration api > apis.txt

# Get turbo-android dependencies and create DEPENDENCIES_GRADLE_FILE
cd ..
rm -rf $DEPENDENCIES_GRADLE_FILE
touch $DEPENDENCIES_GRADLE_FILE
echo "ext {\n\tdeps = [  " > $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./turbo-android/deps.txt | awk '{print "\t\tdep" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
echo "\t]\n\tapis = [" >> $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./turbo-android/apis.txt | awk '{print "\t\tapi" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
echo "\t] \n}" >> $DEPENDENCIES_GRADLE_FILE

# Cleanup
rm -rf turbo-android

