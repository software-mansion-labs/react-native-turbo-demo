TURBO_IOS_REPO_PATH="https://github.com/hotwired/turbo-ios.git"

# First argument is the version tag
if [ -z "$1" ]
  then
    echo "No version tag supplied"
    exit 1
fi

# Clone turbo-ios repository
cd ./ios/vendor
rm -rf turbo-ios
git clone $TURBO_IOS_REPO_PATH

# Use the version tag
cd turbo-ios
git fetch --all --tags --prune
git checkout tags/$1 -B $1
