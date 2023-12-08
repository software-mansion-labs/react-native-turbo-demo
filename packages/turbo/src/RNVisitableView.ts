import {
  NativeSyntheticEvent,
  Platform,
  requireNativeComponent,
  StyleProp,
  UIManager,
  ViewStyle,
} from 'react-native';
import { findNodeHandle } from 'react-native';
import type {
  AlertHandler,
  DispatchCommandTypes,
  LoadEvent,
  MessageEvent,
  VisitProposal,
  VisitProposalError,
} from './types';

// interface should match RNVisitableView exported properties in native code
interface RNVisitableViewProps {
  url: string;
  sessionHandle?: string;
  applicationNameForUserAgent?: string;
  onLoad?: (e: NativeSyntheticEvent<LoadEvent>) => void;
  onMessage?: (e: NativeSyntheticEvent<MessageEvent>) => void;
  onVisitError?: (e: NativeSyntheticEvent<VisitProposalError>) => void;
  onVisitProposal?: (e: NativeSyntheticEvent<VisitProposal>) => void;
  onAlert?: (e: NativeSyntheticEvent<AlertHandler>) => void;
  style?: StyleProp<ViewStyle>;
}

const LINKING_ERROR =
  `The package react-native-turbo doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export function dispatchCommand(
  ref: React.RefObject<any>,
  command: DispatchCommandTypes,
  code: string
) {
  const viewConfig = UIManager.getViewManagerConfig('RNVisitableView');

  if (!viewConfig) {
    throw new Error(LINKING_ERROR);
  }

  UIManager.dispatchViewManagerCommand(
    findNodeHandle(ref.current),
    viewConfig.Commands[command]!,
    [code]
  );
}

const RNVisitableView =
  requireNativeComponent<RNVisitableViewProps>('RNVisitableView');

export default RNVisitableView;
