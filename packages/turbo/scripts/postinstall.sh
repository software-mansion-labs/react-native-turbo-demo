# Check if android/vendor directory exists
if [ ! -d "./android/vendor" ]; then
  # If the vendor folder does not exist, we're not using the published package.
  # We can safely exit here, because postinstall script will be executed again when vendor folder is created. 
  exit 0
fi

VENDOR_DIR=$(realpath ./android/vendor)
PARENT_FOLDER=$(realpath .. | awk -F/ '{print $NF}')

if [ "$PARENT_FOLDER" = "node_modules" ]; then
  REACT_NATIVE_DIR=$(realpath ../react-native/android)
else
  # We are in the monorepo
  REACT_NATIVE_DIR=$(realpath ../../node_modules/react-native/android)
fi

# Copying the vendor files to the react-native android folder is necessary to run the app with react-native run-android command.
rsync -av $VENDOR_DIR/ $REACT_NATIVE_DIR