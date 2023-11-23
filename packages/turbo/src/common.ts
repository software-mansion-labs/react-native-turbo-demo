import { Platform, requireNativeComponent, UIManager } from 'react-native';
import { NativeModules, findNodeHandle } from 'react-native';
import type { DispatchCommand } from './types';

const LINKING_ERROR =
  `The package react-native-turbo doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export enum SessionEvents {
  MESSAGE = 'MESSAGE',
}

export function getNativeComponent<T>(componentName: string): {
  [componentName: string]: any;
  dispatchCommand: DispatchCommand;
} {
  const viewConfig = UIManager.getViewManagerConfig(componentName);

  if (!viewConfig) {
    throw new Error(LINKING_ERROR);
  }

  return {
    [componentName]: requireNativeComponent<T>(componentName),
    dispatchCommand: (
      ref: React.RefObject<any>,
      command: string,
      ...args: any[]
    ) =>
      UIManager.dispatchViewManagerCommand(
        findNodeHandle(ref.current),
        viewConfig.Commands[command]!,
        args
      ),
  };
}

export function getNativeModule<T>(moduleName: string): T {
  return NativeModules[moduleName]
    ? NativeModules[moduleName]
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );
}
