# Build the turbo-ios and turbo-android packages

TURBO_IOS_VERSION=$1
TURBO_ANDROID_VERSION=$2

if [ -z "$TURBO_IOS_VERSION" ]
  then
    echo "No turbo-ios version tag supplied"
    exit 1
fi

if [ -z "$TURBO_ANDROID_VERSION" ]
  then
    echo "No turbo-android version tag supplied"
    exit 1
fi

sh ./scripts/build-turbo-ios.sh $TURBO_IOS_VERSION & sh ./scripts/build-turbo-android.sh $TURBO_ANDROID_VERSION
