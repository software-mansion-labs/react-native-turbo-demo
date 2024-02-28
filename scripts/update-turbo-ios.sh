# First argument is the version tag
if [ -z "$1" ]
  then
    echo "No version tag supplied"
    exit 1
fi

# Patch applied to turbo-ios which fixes the resource loading issue
PATCH_PATH=$(realpath ../patches/turbo-js-resource.patch)

# Update the turbo-ios git submodule
cd ../packages/turbo/ios/turbo-ios
git fetch --all --tags --prune
git checkout tags/$1 -B $1

# Remove all unnecessary files
for item in *
do
  if [[ "$item" != "Source" && "$item" != "README.md" && "$item" != "LICENSE" && "$item" != "CONDUCT.md" ]]
  then
    rm -rf "$item"
  fi
done

# Apply the patch
git apply $PATCH_PATH
git add .
git commit -m "Apply patch"

# Run yarn in the root directory
cd ../../../..
yarn
