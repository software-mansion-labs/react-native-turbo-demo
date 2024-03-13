# Description: Build the turbo-ios and turbo-android packages

if [ -z "$1" ]
  then
    echo "No turbo-ios version tag supplied"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "No turbo-android version tag supplied"
    exit 1
fi

TURBO_IOS_VERSION=$1
TURBO_ANDROID_VERSION=$2

echo "Using turbo-ios version $TURBO_IOS_VERSION"
sh ./scripts/build-turbo-ios.sh $TURBO_IOS_VERSION

echo "Using turbo-android version $TURBO_ANDROID_VERSION"
sh ./scripts/build-turbo-android.sh $TURBO_ANDROID_VERSION

