import {useCallback, useContext} from 'react';
import {NativeModules} from 'react-native';
import {SessionContext} from './SessionContext';

const {RNSessionModule} = NativeModules;

/**
 * Evaluates Javascript code on webview, mind that this function run in the context
 * of webview runtime and doesn't have access to other js functions.
 */
export default function useInjectJavaScript(jsCallback: Function | string) {
  const {sessionHandle} = useContext(SessionContext);

  const injectJavaScript = useCallback(async () => {
    const isString =
      typeof jsCallback === 'string' || jsCallback instanceof String;

    const callbackStringified = isString
      ? jsCallback
      : `(${jsCallback.toString()})()`;

    await RNSessionModule.injectJavaScript(sessionHandle, callbackStringified);
  }, [jsCallback, sessionHandle]);

  return injectJavaScript;
}
