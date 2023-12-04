import {
  NativeSyntheticEvent,
  StyleProp,
  UIManager,
  ViewStyle,
  requireNativeComponent,
} from 'react-native';
import { LINKING_ERROR } from './common';
import { VisitProposal, OnLoadEvent, VisitProposalError } from './types';

export function getNativeComponent<T>(componentName: string) {
  return UIManager.hasViewManagerConfig(componentName)
    ? requireNativeComponent<T>(componentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };
}

export interface RNVisitableViewProps {
  url: string;
  sessionHandle?: string;
  style?: StyleProp<ViewStyle>;
  onVisitProposal: (proposal: NativeSyntheticEvent<VisitProposal>) => void;
  onLoad?: (proposal: NativeSyntheticEvent<OnLoadEvent>) => void;
  onVisitError?: (e: NativeSyntheticEvent<VisitProposalError>) => void;
}

const RNVisitableView =
  getNativeComponent<RNVisitableViewProps>('RNVisitableView');

export default RNVisitableView;
