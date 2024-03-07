TURBO_ANDROID_REPO_PATH="https://github.com/hotwired/turbo-android.git"
TURBO_ANDROID_MAIN_SOURCE_DIR="./turbo/src/main/*"

# First argument is the version tag
if [ -z "$1" ]
  then
    echo "No version tag supplied"
    exit 1
fi

PATCH_DIR=$(realpath ../patches)
TURBO_ANDROID_DIR=$(realpath ../packages/turbo/android)
DEPENDENCIES_GRADLE_FILE="dependencies.gradle"
DEPENDENCY_REGEX="[a-zA-Z0-9.\-]+:[a-zA-Z0-9.\-]+:[0-9a-zA-Z.\-]+"

cd $TURBO_ANDROID_DIR
mkdir vendor

# Shallow clone the turbo-ios repo
rm -rf turbo-android
git clone --branch $1 --depth 1 $TURBO_ANDROID_REPO_PATH

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
touch $DEPENDENCIES_GRADLE_FILE
echo "ext {\n\tdeps = [  " > $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./turbo-android/deps.txt | awk '{print "\t\tdep" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
echo "\t]\n\tapis = [" >> $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./turbo-android/apis.txt | awk '{print "\t\tapi" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
echo "\t] \n}" >> $DEPENDENCIES_GRADLE_FILE

# Cleanup
rm -rf turbo-android

