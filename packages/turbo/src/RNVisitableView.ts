import {
  NativeSyntheticEvent,
  Platform,
  requireNativeComponent,
  StyleProp,
  UIManager,
  ViewStyle,
  Linking,
} from 'react-native';
import { findNodeHandle } from 'react-native';
import type {
  AlertHandler,
  DispatchCommandTypes,
  LoadEvent,
  MessageEvent,
  VisitProposal,
  VisitProposalError,
  OpenExternalUrlEvent,
  FormSubmissionEvent,
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
  onWebAlert?: (e: NativeSyntheticEvent<AlertHandler>) => void;
  onWebConfirm?: (e: NativeSyntheticEvent<AlertHandler>) => void;
  onFormSubmissionStarted?: (
    e: NativeSyntheticEvent<FormSubmissionEvent>
  ) => void;
  onFormSubmissionFinished?: (
    e: NativeSyntheticEvent<FormSubmissionEvent>
  ) => void;
  style?: StyleProp<ViewStyle>;
}

const LINKING_ERROR =
  `The package react-native-turbo doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

function transformCommandToAcceptableType(command: number): number | string {
  if (Platform.OS === 'ios') {
    return command;
  }
  return command.toString();
}

export function dispatchCommand(
  ref: React.RefObject<any>,
  command: DispatchCommandTypes,
  ...args: any[]
) {
  const viewConfig = UIManager.getViewManagerConfig('RNVisitableView');

  if (!viewConfig) {
    throw new Error(LINKING_ERROR);
  }

  const transformedCommand = transformCommandToAcceptableType(
    viewConfig.Commands[command]!
  );

  if (transformedCommand === undefined) {
    return;
  }

  UIManager.dispatchViewManagerCommand(
    findNodeHandle(ref.current),
    transformedCommand,
    args
  );
}

export async function openExternalURL({
  url,
}: OpenExternalUrlEvent): Promise<any> {
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    return await Linking.openURL(url);
  } else {
    console.error(`Don't know how to open this URL: ${url}`);
  }
}

const RNVisitableView =
  requireNativeComponent<RNVisitableViewProps>('RNVisitableView');

export default RNVisitableView;
