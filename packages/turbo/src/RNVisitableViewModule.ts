import { NativeModules } from 'react-native';
import { LINKING_ERROR } from './common';

function getNativeModule<T>(moduleName: string): T {
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

interface VisitableViewModule {
  setConfiguration: (
    sessionHandle: string,
    applicationNameForUserAgent?: string
  ) => Promise<string>;
  registerSession: () => Promise<string>;
  removeSession: (sessionHandle: string) => Promise<string>;
  injectJavaScript: (
    sessionHandle: string | null,
    callbackStringified: string
  ) => Promise<unknown>;
  registerEvent: (eventName: string) => void;
  unregisterEvent: (eventName: string) => void;
}

const RNVisitableViewModule = getNativeModule<VisitableViewModule>(
  'RNVisitableViewModule'
);

export default RNVisitableViewModule;
