import {NativeModules} from 'react-native';

const {SessionNativeModule} = NativeModules;
interface SessionNativeModuleInterface {
  createSession(onCreatedCallback: (sessionId: string) => void): void;
}
export default SessionNativeModule as SessionNativeModuleInterface;
