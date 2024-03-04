TURBO_IOS_REPO_PATH="https://github.com/hotwired/turbo-ios.git"

# First argument is the version tag
if [ -z "$1" ]
  then
    echo "No version tag supplied"
    exit 1
fi

# Shallow clone the turbo-ios repo
cd ./ios/vendor
rm -rf turbo-ios
git clone --branch $1 --depth 1 $TURBO_IOS_REPO_PATH
