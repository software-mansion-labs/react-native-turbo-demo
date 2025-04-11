HOTWIRE_NATIVE_ANDROID_REPO_PATH="https://github.com/hotwired/hotwire-native-android.git"
HOTWIRE_NATIVE_ANDROID_VERSION=$1
PATCH_FILE=$(realpath ./patches/hotwire-native-android.patch)
HOTWIRE_NATIVE_ANDROID_DIR=$(realpath ./android)
DEPENDENCIES_GRADLE_FILE="hotwire-native-android-dependencies.gradle"
DEPENDENCY_REGEX="[a-zA-Z0-9.\-]+:[a-zA-Z0-9.\-]+:[0-9a-zA-Z.\-]+"

# First argument is the version tag
if [ -z "$HOTWIRE_NATIVE_ANDROID_VERSION" ]
  then
    echo "No version tag supplied"
    exit 1
fi

cd $HOTWIRE_NATIVE_ANDROID_DIR
rm -rf vendor
mkdir vendor

# Shallow clone hotwire-native-android repo
rm -rf hotwire-native-android
git clone --branch $HOTWIRE_NATIVE_ANDROID_VERSION --depth 1 $HOTWIRE_NATIVE_ANDROID_REPO_PATH

# Apply patch
cd hotwire-native-android
git apply $PATCH_FILE

# Publish hotwire-native-android to local maven repository
./gradlew -PVersion=local publishToMavenLocal

# Publish hotwire-native-android to vendor directory
./gradlew -Dmaven.repo.local=$HOTWIRE_NATIVE_ANDROID_DIR/vendor -PVersion=local publishToMavenLocal

# Get necessary dependencies from hotwire-native-android build.gradle file
./gradlew core:dependencies --configuration implementation > core-deps.txt
./gradlew core:dependencies --configuration api > core-apis.txt
./gradlew navigation-fragments:dependencies --configuration implementation > nav-deps.txt
./gradlew navigation-fragments:dependencies --configuration api > nav-apis.txt

# Get hotwire-native-android dependencies and create DEPENDENCIES_GRADLE_FILE
cd ..
rm -rf $DEPENDENCIES_GRADLE_FILE
touch $DEPENDENCIES_GRADLE_FILE

echo "ext {\n\tdeps = [  " > $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./hotwire-native-android/core-deps.txt | awk '{print "\t\tdepcore" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./hotwire-native-android/nav-deps.txt | awk '{print "\t\tdepnav" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
echo "\t]\n\tapis = [" >> $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./hotwire-native-android/core-apis.txt | awk '{print "\t\tapicore" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
grep -oE $DEPENDENCY_REGEX ./hotwire-native-android/nav-apis.txt | awk '{print "\t\tapinav" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE
echo "\t] \n}" >> $DEPENDENCIES_GRADLE_FILE

# Cleanup
rm -rf hotwire-native-android
