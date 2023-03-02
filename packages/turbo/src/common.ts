import type { SessionMessageCallback } from 'packages/turbo/src/types';
import type { EmitterSubscription } from 'react-native';
import {
  DeviceEventEmitter,
  Platform,
  requireNativeComponent,
  UIManager,
} from 'react-native';
import { NativeModules } from 'react-native';

const LINKING_ERROR =
  `The package react-native-turbo doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export enum SessionEvents {
  MESSAGE = 'MESSAGE',
}

export function getNativeComponent<T>(componentName: string) {
  return UIManager.getViewManagerConfig(componentName) != null
    ? requireNativeComponent<T>(componentName)
    : () => {
        throw new Error(LINKING_ERROR);
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

export function registerMessageEventListener(
  sessionHandle: string,
  onMessage: SessionMessageCallback
): EmitterSubscription {
  const eventName = `sessionMessage${sessionHandle}`;
  return DeviceEventEmitter.addListener(eventName, onMessage);
}
