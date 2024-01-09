import { NativeModules } from 'react-native';

interface RNSessionManager {
  clearSnapshotCacheForAllSessions(): void;
}

const { RNSessionManager } = NativeModules as {
  RNSessionManager: RNSessionManager;
};

export const { clearSnapshotCacheForAllSessions } = RNSessionManager;
