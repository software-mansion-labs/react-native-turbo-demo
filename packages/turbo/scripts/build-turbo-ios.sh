TURBO_IOS_REPO_PATH="https://github.com/hotwired/turbo-ios.git"
TURBO_IOS_VERSION=$1
PATCH_FILE=$(realpath ./patches/turbo-ios.patch)

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

# Apply patch
cd turbo-ios
git apply $PATCH_FILE

# Keep the Source folder and remove the rest
for file in *; do
  if [ "$file" != "Source" ]; then
    rm -rf $file
  fi
done
