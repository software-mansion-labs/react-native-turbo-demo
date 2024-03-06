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

# Get necessary dependencies from turbo build.gradle
./gradlew turbo:dependencies --configuration implementation > deps.txt
./gradlew turbo:dependencies --configuration api > api.txt

cd ../..
DEPENDENCIES_GRADLE_FILE="dependencies.gradle"

touch $DEPENDENCIES_GRADLE_FILE

echo "ext {\n\tdeps = [  " > $DEPENDENCIES_GRADLE_FILE

grep -oE  "[a-zA-Z0-9.\-]+:[a-zA-Z0-9.\-]+:[0-9a-zA-Z.\-]+" ./vendor/turbo-android/deps.txt | awk '{print "\t\tdep" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE

echo "\t]\n\tapis = [" >> $DEPENDENCIES_GRADLE_FILE

grep -oE  "[a-zA-Z0-9.\-]+:[a-zA-Z0-9.\-]+:[0-9a-zA-Z.\-]+" ./vendor/turbo-android/api.txt | awk '{print "\t\tapi" NR ": " "\""$1"\"" ","}' >> $DEPENDENCIES_GRADLE_FILE

echo "\t] \n}" >> $DEPENDENCIES_GRADLE_FILE

