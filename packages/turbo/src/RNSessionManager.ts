import { NativeModules } from 'react-native';

interface IRNSessionManager {
  getSessionHandles(): Promise<string[]>;
  reloadSession: (name: string) => Promise<void>;
  refreshSession: (name: string) => Promise<void>;
  clearSessionSnapshotCache: (name: string) => Promise<void>;
}

const { RNSessionManager } = NativeModules as {
  RNSessionManager: IRNSessionManager;
};

export const {
  getSessionHandles,
  reloadSession,
  refreshSession,
  clearSessionSnapshotCache,
} = RNSessionManager;
