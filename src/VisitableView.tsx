import React from 'react';
import {NativeSyntheticEvent, StyleSheet} from 'react-native';
import VisitableViewNativeComponent from './VisitableViewNativeComponent';

export interface VisitProposal {
  url: string;
  action: 'advance' | 'replace' | 'restore';
}

export interface OnLoadEvent {
  title: string;
}

interface Props {
  url: string;
  onVisitProposal: (proposal: NativeSyntheticEvent<VisitProposal>) => void;
  onLoad: (proposal: NativeSyntheticEvent<OnLoadEvent>) => void;
}

const VisitableView: React.FC<Props> = props => {
  return <VisitableViewNativeComponent {...props} style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VisitableView;
