import { NativeModules } from 'react-native';

interface RNSessionManager {
  getRegisteredSessionHandles(): Promise<string[]>;
  reloadSessionByName: (name: string) => Promise<void>;
  clearSessionSnapshotCacheByName: (name: string) => Promise<void>;
}

const { RNSessionManager } = NativeModules as {
  RNSessionManager: RNSessionManager;
};

export const {
  getRegisteredSessionHandles,
  reloadSessionByName,
  clearSessionSnapshotCacheByName,
} = RNSessionManager;
