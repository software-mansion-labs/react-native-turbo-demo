import type { SessionMessageCallback } from 'packages/turbo/src/types';
import type { EmitterSubscription } from 'react-native';
import { NativeEventEmitter, Platform } from 'react-native';
import { NativeModules } from 'react-native';

export const LINKING_ERROR =
  `The package react-native-turbo doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export enum SessionEvents {
  MESSAGE = 'MESSAGE',
}

const eventEmitter = new NativeEventEmitter(
  NativeModules.RNVisitableViewModule
);

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
  eventName: string,
  onMessage: SessionMessageCallback
): EmitterSubscription {
  NativeModules.RNVisitableViewModule.registerEvent(eventName);
  return eventEmitter.addListener(eventName, onMessage);
}
