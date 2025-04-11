# Build the hotwire-native-ios and hotwire-native-android packages

HOTWIRE_NATIVE_IOS_VERSION=$1
HOTWIRE_NATIVE_ANDROID_VERSION=$2

if [ -z "$HOTWIRE_NATIVE_IOS_VERSION" ]
  then
    echo "No hotwire-native-ios version tag supplied"
    exit 1
fi

if [ -z "$HOTWIRE_NATIVE_ANDROID_VERSION" ]
  then
    echo "No hotwire-native-android version tag supplied"
    exit 1
fi

sh ./scripts/build-hotwire-native-ios.sh $HOTWIRE_NATIVE_IOS_VERSION & sh ./scripts/build-hotwire-native-android.sh $HOTWIRE_NATIVE_ANDROID_VERSION
