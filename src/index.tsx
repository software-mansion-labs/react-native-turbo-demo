import {
  requireNativeComponent,
  UIManager,
  Platform,
  ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-turbo-webview' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type TurboWebviewProps = {
  color: string;
  style: ViewStyle;
};

const ComponentName = 'TurboWebviewView';

export const TurboWebviewView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<TurboWebviewProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };
