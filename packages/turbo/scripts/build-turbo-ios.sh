TURBO_IOS_REPO_PATH="https://github.com/hotwired/turbo-ios.git"
TURBO_IOS_VERSION=$1

shopt -s extglob

# First argument is the version tag
if [ -z "$TURBO_IOS_VERSION" ]
  then
    echo "No version tag supplied"
    exit 1
fi

echo "turbo-ios version: $TURBO_IOS_VERSION"

# Shallow clone the turbo-ios repo
cd ./ios
rm -rf vendor
mkdir vendor
cd vendor
git clone --branch $TURBO_IOS_VERSION --depth 1 $TURBO_IOS_REPO_PATH

# Remove all files except Source directory
cd turbo-ios
rm -rf !(Source)
