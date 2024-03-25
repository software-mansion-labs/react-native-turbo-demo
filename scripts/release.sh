PACKAGE_NAME=$(grep -m1 name package.json | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
OLD_VERSION=$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

# Checkout to release branch
git checkout -B next

# Build the library
turbo build

# Run release-it
release-it --config ../../.release-it.js --only-version

git checkout next

VERSION=$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

# Create release PR and merge it
gh pr create --title "Release $PACKAGE_NAME@$VERSION" --body "Release new version of the library." 
PR_NUMBER=$(gh pr list | grep "$PACKAGE_NAME@$VERSION" | awk '{print $1}')
gh pr merge $PR_NUMBER --squash --delete-branch

# Create release
BASE_COMMAND="gh release create "$PACKAGE_NAME@$VERSION" --title "$PACKAGE_NAME@$VERSION" --generate-notes --notes-start-tag "$PACKAGE_NAME@$OLD_VERSION""

read -p "Is it a pre-release? (y/n) " -n 1 -r

if [[ $REPLY =~ ^[Yy]$ ]]
then
    $BASE_COMMAND --prerelease
else
    $BASE_COMMAND
fi

# Cleanup 
cd ../..
git checkout .
