TURBO_ANDROID_REPO_PATH="https://github.com/hotwired/turbo-android.git"
TURBO_ANDROID_MAIN_SOURCE_DIR="./turbo/src/main/*"
TURBO_ANDROID_VERSION=$1
PATCH_FILE=$(realpath ./patches/turbo-android.patch)
TURBO_ANDROID_DIR=$(realpath ./android)
DEPENDENCIES_GRADLE_FILE="turbo-android-dependencies.gradle"
DEPENDENCY_REGEX="[a-zA-Z0-9.\-]+:[a-zA-Z0-9.\-]+:[0-9a-zA-Z.\-]+"

# First argument is the version tag
if [ -z "$TURBO_ANDROID_VERSION" ]
  then
    echo "No version tag supplied"
    exit 1
fi

cd $TURBO_ANDROID_DIR
rm -rf vendor
mkdir vendor

# Shallow clone the turbo-ios repo
rm -rf turbo-android
git clone --branch $TURBO_ANDROID_VERSION --depth 1 $TURBO_ANDROID_REPO_PATH

# Apply patch
cd turbo-android
git apply $PATCH_FILE

# Publish turbo-android to local maven repository
./gradlew -PVersion=local publishToMavenLocal

# Publish turbo-android to vendor directory
./gradlew -Dmaven.repo.local=$TURBO_ANDROID_DIR/vendor -PVersion=local publishToMavenLocal

# Get necessary dependencies from turbo-android build.gradle file
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
