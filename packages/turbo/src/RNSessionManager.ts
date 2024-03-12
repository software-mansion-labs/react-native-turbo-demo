import { NativeModules } from 'react-native';

interface RNSessionManager {
  getSessionHandles(): Promise<string[]>;
  reloadSession: (name: string) => Promise<void>;
  refreshSession: (name: string) => Promise<void>;
  clearSessionSnapshotCache: (name: string) => Promise<void>;
}

const { RNSessionManager } = NativeModules as {
  RNSessionManager: RNSessionManager;
};

export const {
  getSessionHandles,
  reloadSession,
  refreshSession,
  clearSessionSnapshotCache,
} = RNSessionManager;
